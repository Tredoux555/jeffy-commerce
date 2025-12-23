'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, ExternalLink, Package, Plus, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProcurementResearchPage() {
  const [url1688, setUrl1688] = useState('');
  const [productName, setProductName] = useState('');
  const [costCny, setCostCny] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const estimatedCostZar = costCny ? (parseFloat(costCny) * 3.2).toFixed(2) : '0';
  const suggestedPrice = costCny ? (parseFloat(costCny) * 3.2 * 2.5).toFixed(2) : '0';

  const handleSearch1688 = () => {
    const searchUrl = `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(productName)}`;
    window.open(searchUrl, '_blank');
  };

  const handleCopyForAgent = () => {
    const message = `🛒 New Product Request

Product: ${productName}
1688 URL: ${url1688}
Cost: ¥${costCny} (~R${estimatedCostZar})

Notes: ${notes || 'None'}

Please confirm availability and shipping cost to SA.`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProcurement = async () => {
    if (!url1688 || !productName) {
      alert('Please enter product name and 1688 URL');
      return;
    }

    setSaving(true);
    // TODO: Save to procurement_orders table
    alert('Procurement order saved! (Database save coming soon)');
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/procurement">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">1688 Product Research</h1>
          <p className="text-gray-600">Find products on 1688 and prepare for Chinese agent</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Search Section */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Step 1: Find Product on 1688</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Product Name / Keywords</label>
            <Input
              placeholder="e.g., wireless earbuds, stanley tumbler"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <Button onClick={handleSearch1688} className="w-full" disabled={!productName}>
            <Search className="h-4 w-4 mr-2" />
            Search on 1688.com
          </Button>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-1">1688 Product URL</label>
            <Input
              placeholder="https://detail.1688.com/offer/..."
              value={url1688}
              onChange={(e) => setUrl1688(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the URL of the product you found on 1688
            </p>
          </div>

          {url1688 && (
            <Link
              href={url1688}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:underline text-sm"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open product page
            </Link>
          )}
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Step 2: Calculate Pricing</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Cost Price (CNY ¥)</label>
            <Input
              type="number"
              placeholder="e.g., 45"
              value={costCny}
              onChange={(e) => setCostCny(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cost (CNY)</span>
              <span>¥{costCny || '0'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Est. Cost (ZAR) @ 3.2</span>
              <span>R{estimatedCostZar}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">+ Shipping (~R50-100)</span>
              <span>R50-100</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Suggested Sell Price (2.5x)</span>
              <span className="text-green-600">R{suggestedPrice}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes for Agent</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]"
              placeholder="Color: Black, Size: Large, Quantity: 10 units..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Step 3: Send to Chinese Agent</h2>

        <div className="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm whitespace-pre-wrap">
{`🛒 New Product Request

Product: ${productName || '[Product name]'}
1688 URL: ${url1688 || '[1688 URL]'}
Cost: ¥${costCny || '0'} (~R${estimatedCostZar})

Notes: ${notes || 'None'}

Please confirm availability and shipping cost to SA.`}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCopyForAgent} variant="outline" className="flex-1">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy for WhatsApp'}
          </Button>
          <Button onClick={handleSaveProcurement} disabled={saving || !url1688} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Procurement Order'}
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-medium text-blue-900 mb-2">How to use this tool:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Enter the product name and click "Search on 1688.com"</li>
          <li>Browse 1688 results (use Google Translate if needed)</li>
          <li>Copy the product URL and paste it here</li>
          <li>Enter the CNY price to calculate ZAR pricing</li>
          <li>Copy the message and send to your Chinese agent on WhatsApp</li>
          <li>Once confirmed, save as a procurement order</li>
        </ol>
      </div>
    </div>
  );
}
