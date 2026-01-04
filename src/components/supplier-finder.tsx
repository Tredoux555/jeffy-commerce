'use client';

import { useState } from 'react';
import { MapPin, Phone, MessageCircle, X, Store, Users, ChevronRight } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  location_name: string;
  categories: string[];
  bio: string | null;
}

interface SupplierFinderProps {
  productName?: string;
  productCategory?: string;
  buttonText?: string;
  variant?: 'button' | 'card';
}

export function SupplierFinder({ 
  productName = 'this product',
  productCategory,
  buttonText = 'Find Local Supplier',
  variant = 'button'
}: SupplierFinderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const findSuppliers = async () => {
    setLoading(true);
    setIsOpen(true);
    
    try {
      const params = new URLSearchParams();
      if (productCategory) params.set('category', productCategory);
      
      const res = await fetch(`/api/suppliers/search?${params}`);
      const data = await res.json();
      
      setSuppliers(data.suppliers || []);
      setSearched(true);
    } catch (error) {
      console.error('Failed to find suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatWhatsAppUrl = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? `27${cleanPhone.slice(1)}` : cleanPhone;
    const message = encodeURIComponent(`Hi ${name}! I found you on Jeffy and I'm interested in ${productName}. Do you have it in stock?`);
    return `https://wa.me/${intlPhone}?text=${message}`;
  };

  if (variant === 'card') {
    return (
      <>
        <button
          onClick={findSuppliers}
          className="w-full bg-gray-900 border border-gray-700 hover:border-green-500 rounded-xl p-4 flex items-center justify-between transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-white block">{buttonText}</span>
              <span className="text-sm text-gray-500">Buy from someone nearby</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-green-500 transition" />
        </button>

        {/* Modal */}
        {isOpen && (
          <SupplierModal
            suppliers={suppliers}
            loading={loading}
            searched={searched}
            productName={productName}
            onClose={() => setIsOpen(false)}
            formatWhatsAppUrl={formatWhatsAppUrl}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={findSuppliers}
        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg transition"
      >
        <MapPin className="h-4 w-4" />
        {buttonText}
      </button>

      {/* Modal */}
      {isOpen && (
        <SupplierModal
          suppliers={suppliers}
          loading={loading}
          searched={searched}
          productName={productName}
          onClose={() => setIsOpen(false)}
          formatWhatsAppUrl={formatWhatsAppUrl}
        />
      )}
    </>
  );
}

function SupplierModal({
  suppliers,
  loading,
  searched,
  productName,
  onClose,
  formatWhatsAppUrl,
}: {
  suppliers: Supplier[];
  loading: boolean;
  searched: boolean;
  productName: string;
  onClose: () => void;
  formatWhatsAppUrl: (phone: string, name: string) => string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-green-500" />
            <span className="font-bold text-white">Local Suppliers</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Finding suppliers near you...</p>
            </div>
          ) : suppliers.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-4">
                {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} found. Contact them directly:
              </p>
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white">{supplier.name}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {supplier.location_name}
                      </p>
                    </div>
                  </div>
                  
                  {supplier.bio && (
                    <p className="text-sm text-gray-300 mb-3">{supplier.bio}</p>
                  )}
                  
                  {supplier.categories && supplier.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {supplier.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a
                      href={formatWhatsAppUrl(supplier.whatsapp || supplier.phone, supplier.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${supplier.phone}`}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : searched ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="font-bold text-white mb-2">No suppliers yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Be the first to sell {productName} in your area!
              </p>
              <a
                href="/hustle/register"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg transition text-sm"
              >
                <Store className="h-4 w-4" />
                Register as Supplier
              </a>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <p className="text-xs text-gray-500 text-center">
            Powered by <span className="text-green-500">Jeffy</span> • Connecting communities
          </p>
        </div>
      </div>
    </div>
  );
}
