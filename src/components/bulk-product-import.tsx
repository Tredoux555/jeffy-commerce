'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download, X, Loader2 } from 'lucide-react';

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export function BulkProductImport() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Parse CSV preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const rows = lines.slice(1, 6).map((line, idx) => { // Preview first 5 rows
        const values = parseCSVLine(line);
        const row: Record<string, string> = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        row._row = String(idx + 2);
        return row;
      });

      setPreview(rows);
      setStep('preview');
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleImport = async () => {
    if (!file) return;

    setStep('importing');
    setImporting(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
      setStep('done');
    } catch (error) {
      setResult({
        total: 0,
        success: 0,
        failed: 1,
        errors: [{ row: 0, error: 'Failed to process file' }],
      });
      setStep('done');
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    setStep('upload');
  };

  const downloadTemplate = () => {
    const template = `name,sku,category,selling_price,compare_price,cost_price,stock,description,image_url
"Example Product 1",SKU001,Electronics,29900,39900,15000,100,"Product description here","https://example.com/image1.jpg"
"Example Product 2",SKU002,Home,14900,19900,8000,50,"Another product","https://example.com/image2.jpg"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jeffy_product_template.csv';
    a.click();
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-xl font-bold mb-6">Bulk Product Import</h2>

      {step === 'upload' && (
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#ff6b35] transition cursor-pointer" onClick={() => document.getElementById('csv-input')?.click()}>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
            <p className="text-gray-500 text-sm mb-4">or click to browse</p>
            <input
              id="csv-input"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h3 className="font-medium text-blue-800 mb-2">CSV Format Requirements</h3>
            <p className="text-sm text-blue-700 mb-3">Your CSV should have these columns:</p>
            <code className="text-xs bg-blue-100 px-2 py-1 rounded">
              name, sku, category, selling_price, compare_price, cost_price, stock, description, image_url
            </code>
            <p className="text-sm text-blue-600 mt-3">Prices should be in cents (e.g., 29900 = R299.00)</p>
          </div>

          <button onClick={downloadTemplate} className="mt-4 flex items-center gap-2 text-[#ff6b35] hover:underline">
            <Download className="h-4 w-4" /> Download CSV Template
          </button>
        </div>
      )}

      {step === 'preview' && preview.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" />
              <span className="font-medium">{file?.name}</span>
            </div>
            <button onClick={reset} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-x-auto border rounded-lg mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Row</th>
                  {Object.keys(preview[0]).filter(k => k !== '_row').map(key => (
                    <th key={key} className="px-3 py-2 text-left">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2 text-gray-500">{row._row}</td>
                    {Object.entries(row).filter(([k]) => k !== '_row').map(([key, value]) => (
                      <td key={key} className="px-3 py-2 max-w-[150px] truncate">{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-gray-500 text-sm mb-4">Showing first 5 rows. Full import will process all rows.</p>

          <div className="flex gap-3">
            <button onClick={reset} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleImport} className="flex-1 bg-[#ff6b35] text-white py-2 rounded-lg font-bold hover:bg-orange-600">
              Import All Products
            </button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-[#ff6b35] mx-auto mb-4" />
          <p className="text-lg font-medium">Importing products...</p>
          <p className="text-gray-500">This may take a moment</p>
        </div>
      )}

      {step === 'done' && result && (
        <div>
          <div className={`p-4 rounded-xl mb-6 ${result.failed === 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
            <div className="flex items-center gap-3">
              {result.failed === 0 ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-amber-600" />
              )}
              <div>
                <p className="font-bold text-lg">Import Complete</p>
                <p className="text-sm">{result.success} of {result.total} products imported successfully</p>
              </div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Errors ({result.errors.length})</h3>
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                {result.errors.map((err, idx) => (
                  <div key={idx} className="px-3 py-2 border-b last:border-b-0 text-sm">
                    <span className="text-red-600">Row {err.row}:</span> {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={reset} className="w-full bg-gray-100 py-3 rounded-lg font-medium hover:bg-gray-200">
            Import More Products
          </button>
        </div>
      )}
    </div>
  );
}

// Helper to parse CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
