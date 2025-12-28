'use client';

import { useState } from 'react';
import { Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConvertToProductButtonProps {
  wantId: string;
  wantTitle: string;
  disabled?: boolean;
}

export function ConvertToProductButton({ wantId, wantTitle, disabled }: ConvertToProductButtonProps) {
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const handleConvert = async () => {
    if (converting || converted) return;
    
    setConverting(true);
    
    try {
      const res = await fetch('/api/wants/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wantId }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setConverted(true);
        setProductSlug(data.product?.slug);
        setWhatsappUrl(data.whatsappUrl);
        
        // Open WhatsApp to notify creator
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank');
        }
      } else {
        alert(data.error || 'Conversion failed');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    
    setConverting(false);
  };

  if (converted) {
    return (
      <div className="flex gap-2">
        <span className="text-green-600 text-sm font-medium">✓ Converted!</span>
        {productSlug && (
          <a href={`/admin/products`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" /> View Product
            </Button>
          </a>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={handleConvert}
      disabled={converting || disabled}
      className="bg-purple-600 hover:bg-purple-700"
      size="sm"
    >
      {converting ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      ) : (
        <Sparkles className="h-4 w-4 mr-1" />
      )}
      {converting ? 'Converting...' : 'Convert to Product'}
    </Button>
  );
}
