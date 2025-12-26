'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Check, X, AlertTriangle, Download, Loader2 } from 'lucide-react';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function BulkProductImport() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);

    // Parse CSV for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx]?.trim() || '';
        });
        return row;
      });

      setPreview(data);
    };
    reader.readAsText(selected);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: 0, failed: 0, errors: ['Import failed'] });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'name,sku,category,price,compare_price,stock,description\n"Product Name","SKU-001","Electronics",299.99,399.99,100,"Product description here"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jeffy_product_template.csv';
    a.click();
  };

  return (
    <div className="bg-white rounded-xl border">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="font-bold">Bulk Product Import</h2>
        <button onClick={downloadTemplate} className="text-sm text-[#ff6b35] hover:underline flex items-center gap-1">
          <Download className="h-4 w-4" /> Download Template
        </button>
      </div>

      <div className="p-6">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[#ff6b35] hover:bg-orange-50 transition"
        >
          <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileSelect} className="hidden" />
          <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          {file ? (
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-900">Click to upload CSV</p>
              <p className="text-sm text-gray-500">or drag and drop</p>
            </div>
          )}
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Preview (first 5 rows)</h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).map((key) => (
                      <th key={key} className="px-3 py-2 text-left font-medium text-gray-600">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      {Object.values(row).map((val: any, i) => (
                        <td key={i} className="px-3 py-2 truncate max-w-[150px]">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.failed > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center gap-4">
              {result.failed > 0 ? (
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              ) : (
                <Check className="h-8 w-8 text-green-500" />
              )}
              <div>
                <p className="font-bold">{result.success} products imported successfully</p>
                {result.failed > 0 && <p className="text-amber-700">{result.failed} failed</p>}
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-3 text-sm text-amber-700">
                <p className="font-medium">Errors:</p>
                <ul className="list-disc list-inside">
                  {result.errors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Import Button */}
        {file && !result && (
          <button
            onClick={handleImport}
            disabled={importing}
            className="mt-6 w-full bg-[#ff6b35] text-white py-3 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {importing ? <><Loader2 className="h-5 w-5 animate-spin" /> Importing...</> : <><Upload className="h-5 w-5" /> Import Products</>}
          </button>
        )}
      </div>
    </div>
  );
}
