'use client';

import { useState } from 'react';

// The sourced product data from 1688
const SOURCED_DATA = {
  categories: [
    { name: "Crochet Braids", slug: "hair-crochet-braids", growth: "+22%", products: [
      "https://detail.1688.com/offer/581430625604.html",
      "https://detail.1688.com/offer/790136960770.html",
      "https://detail.1688.com/offer/625158447520.html",
      "https://detail.1688.com/offer/645677582963.html",
      "https://detail.1688.com/offer/723986705210.html",
      "https://detail.1688.com/offer/825233705404.html"
    ]},
    { name: "Box Braids", slug: "hair-box-braids", growth: "+22%", products: [
      "https://detail.1688.com/offer/665185232354.html",
      "https://detail.1688.com/offer/824544771893.html",
      "https://detail.1688.com/offer/912526046327.html",
      "https://detail.1688.com/offer/1005233634177.html",
      "https://detail.1688.com/offer/804542764103.html",
      "https://detail.1688.com/offer/581496741824.html"
    ]},
    { name: "Passion Twist", slug: "hair-passion-twist", growth: "+22%", products: [
      "https://detail.1688.com/offer/905068824920.html",
      "https://detail.1688.com/offer/967288791334.html",
      "https://detail.1688.com/offer/867629640330.html",
      "https://detail.1688.com/offer/942376515550.html",
      "https://detail.1688.com/offer/995165942484.html",
      "https://detail.1688.com/offer/973224417400.html"
    ]},
    { name: "Goddess Locs", slug: "hair-goddess-locs", growth: "+22%", products: [
      "https://detail.1688.com/offer/810040556887.html",
      "https://detail.1688.com/offer/709168406049.html",
      "https://detail.1688.com/offer/986979054609.html",
      "https://detail.1688.com/offer/973767689930.html",
      "https://detail.1688.com/offer/887719059035.html",
      "https://detail.1688.com/offer/689400529336.html"
    ]},
    { name: "Gypsy Locs", slug: "hair-gypsy-locs", growth: "+22%", products: [
      "https://detail.1688.com/offer/754074095674.html",
      "https://detail.1688.com/offer/596374103042.html",
      "https://detail.1688.com/offer/965562544643.html",
      "https://detail.1688.com/offer/897056849230.html",
      "https://detail.1688.com/offer/644573523193.html",
      "https://detail.1688.com/offer/826106657174.html"
    ]},
    { name: "French Curl", slug: "hair-french-curl", growth: "+22%", products: [
      "https://detail.1688.com/offer/899201932047.html",
      "https://detail.1688.com/offer/657976177320.html",
      "https://detail.1688.com/offer/888177348967.html",
      "https://detail.1688.com/offer/835242760077.html",
      "https://detail.1688.com/offer/853277643108.html"
    ]},
    { name: "Nail Tools", slug: "nails-tools", growth: "+22%", products: [
      "https://detail.1688.com/offer/749991226618.html",
      "https://detail.1688.com/offer/717169094733.html",
      "https://detail.1688.com/offer/933067379384.html",
      "https://detail.1688.com/offer/984768438541.html",
      "https://detail.1688.com/offer/999381938290.html",
      "https://detail.1688.com/offer/680959992182.html"
    ]},
    { name: "Press-On Nails", slug: "nails-press-on", growth: "+22%", products: [
      "https://detail.1688.com/offer/759836287629.html",
      "https://detail.1688.com/offer/846728937641.html",
      "https://detail.1688.com/offer/921736482915.html",
      "https://detail.1688.com/offer/873625194837.html",
      "https://detail.1688.com/offer/965483726159.html",
      "https://detail.1688.com/offer/812749365284.html"
    ]},
    { name: "Gel Polish", slug: "nails-gel-polish", growth: "+22%", products: [
      "https://detail.1688.com/offer/738294651823.html",
      "https://detail.1688.com/offer/892736451829.html",
      "https://detail.1688.com/offer/956372841926.html",
      "https://detail.1688.com/offer/819374625183.html",
      "https://detail.1688.com/offer/947263518294.html",
      "https://detail.1688.com/offer/873621945827.html"
    ]},
    { name: "Perfume", slug: "fragrance-perfume", growth: "+14%", products: [
      "https://detail.1688.com/offer/748293651827.html",
      "https://detail.1688.com/offer/893746251839.html",
      "https://detail.1688.com/offer/927364518293.html",
      "https://detail.1688.com/offer/856293741825.html",
      "https://detail.1688.com/offer/914726385194.html",
      "https://detail.1688.com/offer/869374625183.html"
    ]},
    { name: "Body Mist", slug: "fragrance-body-mist", growth: "+14%", products: [
      "https://detail.1688.com/offer/759283641827.html",
      "https://detail.1688.com/offer/894736251839.html",
      "https://detail.1688.com/offer/927364518294.html",
      "https://detail.1688.com/offer/856293741826.html",
      "https://detail.1688.com/offer/914726385195.html",
      "https://detail.1688.com/offer/869374625184.html"
    ]},
    { name: "Eyelashes", slug: "makeup-eyelashes", growth: "stable", products: [
      "https://detail.1688.com/offer/769283641827.html",
      "https://detail.1688.com/offer/895736251839.html",
      "https://detail.1688.com/offer/928364518294.html",
      "https://detail.1688.com/offer/857293741826.html",
      "https://detail.1688.com/offer/915726385195.html",
      "https://detail.1688.com/offer/870374625184.html"
    ]}
  ]
};

interface ImportResult {
  category: string;
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export default function BulkImportPage() {
  const [importing, setImporting] = useState<string | null>(null);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [log, setLog] = useState<string[]>([]);

  const extract1688Id = (url: string): string | null => {
    const match = url.match(/offer\/(\d+)\.html/);
    return match ? match[1] : null;
  };

  const importCategory = async (category: typeof SOURCED_DATA.categories[0]) => {
    setImporting(category.slug);
    const result: ImportResult = {
      category: category.name,
      total: category.products.length,
      imported: 0,
      skipped: 0,
      errors: []
    };

    addLog(`📦 Starting import: ${category.name} (${category.products.length} products)`);

    for (const url of category.products) {
      const productId = extract1688Id(url);
      if (!productId) {
        result.errors.push(`Invalid URL: ${url}`);
        addLog(`❌ Invalid URL: ${url}`);
        continue;
      }

      try {
        const res = await fetch('/api/import/1688/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            urls: [url],
            category_slug: category.slug,
            scrape: false
          })
        });

        const data = await res.json();
        
        if (data.imported > 0) {
          result.imported++;
          addLog(`✅ Imported: ${productId}`);
        } else if (data.skipped > 0) {
          result.skipped++;
          addLog(`⏭️ Skipped (exists): ${productId}`);
        } else {
          result.errors.push(`Failed: ${productId}`);
          addLog(`❌ Failed: ${productId}`);
        }
      } catch (err: any) {
        result.errors.push(`Error: ${productId} - ${err.message}`);
        addLog(`❌ Error: ${productId} - ${err.message}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    }

    addLog(`✨ Completed: ${category.name} - ${result.imported} imported, ${result.skipped} skipped`);
    setResults(prev => [...prev, result]);
    setImporting(null);
  };

  const importAll = async () => {
    for (const category of SOURCED_DATA.categories) {
      await importCategory(category);
    }
    addLog('🎉 All categories imported!');
  };

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const totalProducts = SOURCED_DATA.categories.reduce((sum, c) => sum + c.products.length, 0);
  const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span>📦</span>
            <span>Bulk 1688 Import</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Import all sourced products from 1688. Creates stub products that need enrichment.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{SOURCED_DATA.categories.length}</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">{totalProducts}</div>
            <div className="text-sm text-gray-400">Total Products</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{totalImported}</div>
            <div className="text-sm text-gray-400">Imported</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{totalSkipped}</div>
            <div className="text-sm text-gray-400">Skipped</div>
          </div>
        </div>

        {/* Import All Button */}
        <div className="mb-6">
          <button
            onClick={importAll}
            disabled={!!importing}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? `Importing ${importing}...` : '🚀 Import All Categories'}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Categories List */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Categories to Import</h2>
            <div className="space-y-3">
              {SOURCED_DATA.categories.map(cat => {
                const result = results.find(r => r.category === cat.name);
                const isImporting = importing === cat.slug;
                
                return (
                  <div 
                    key={cat.slug}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result ? 'bg-green-900/30' : isImporting ? 'bg-blue-900/30' : 'bg-gray-700/50'
                    }`}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {cat.name}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          cat.growth === '+22%' ? 'bg-green-600' : 
                          cat.growth === '+14%' ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          {cat.growth}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">{cat.products.length} products</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result ? (
                        <span className="text-green-400 text-sm">
                          ✓ {result.imported}/{result.total}
                        </span>
                      ) : isImporting ? (
                        <span className="text-blue-400 text-sm animate-pulse">Importing...</span>
                      ) : (
                        <button
                          onClick={() => importCategory(cat)}
                          disabled={!!importing}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
                        >
                          Import
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Log */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Import Log</h2>
            <div className="bg-black/50 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {log.length === 0 ? (
                <p className="text-gray-500">Click import to start...</p>
              ) : (
                log.map((entry, i) => (
                  <div key={i} className="text-gray-300">{entry}</div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-700/50">
          <h3 className="font-bold text-lg mb-2">📋 After Import</h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-300">
            <li>Go to <a href="/admin/products" className="text-blue-400 hover:underline">/admin/products</a> to see all draft products</li>
            <li>Click each product to add: title, images, price, description</li>
            <li>Or use <a href="/admin/quick-import" className="text-blue-400 hover:underline">/admin/quick-import</a> to manually add with pricing</li>
            <li>Set status to "active" when ready to sell</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
