'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Loader2, Search, Scan, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageSearchProps {
  onSearch: (imageData: string) => Promise<Array<{ id: string; name: string; image: string; similarity: number }>>;
}

export function ImageSearch({ onSearch }: ImageSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ id: string; name: string; image: string; similarity: number }> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    
    setImage(canvas.toDataURL('image/jpeg'));
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const handleSearch = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const results = await onSearch(image);
      setResults(results);
    } catch (err) {
      console.error('Image search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResults(null);
    stopCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        title="Search by image"
      >
        <Camera className="h-5 w-5 text-gray-600" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Scan className="h-5 w-5 text-[#ff6b35]" />
                Search by Image
              </h2>
              <button onClick={() => { setIsOpen(false); reset(); }} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {!image && !cameraActive && (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm text-center">
                    Upload an image or take a photo to find similar products
                  </p>
                  
                  {/* Upload Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#ff6b35] transition"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium">Click to upload</p>
                    <p className="text-sm text-gray-500">or drag and drop</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Camera Button */}
                  <Button onClick={startCamera} variant="outline" className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Take a Photo
                  </Button>
                </div>
              )}

              {/* Camera View */}
              {cameraActive && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-4 border-white/30 rounded-xl m-8 pointer-events-none" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={stopCamera} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={captureImage} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                  </div>
                </div>
              )}

              {/* Preview */}
              {image && !results && (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <img src={image} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      onClick={reset}
                      className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Button onClick={handleSearch} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Find Similar Products
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Results */}
              {results && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Similar Products</h3>
                    <button onClick={reset} className="text-sm text-[#ff6b35] hover:underline">
                      Search Again
                    </button>
                  </div>
                  
                  {results.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {results.map((product) => (
                        <a
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="border rounded-lg p-2 hover:border-[#ff6b35] transition"
                        >
                          <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                          <p className="text-xs text-gray-500">{Math.round(product.similarity * 100)}% match</p>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No similar products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
