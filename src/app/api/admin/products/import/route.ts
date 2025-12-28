import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

    const supabase = await createClient();
    const results = { total: 0, success: 0, failed: 0, errors: [] as Array<{ row: number; error: string }> };

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      results.total++;
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.replace(/^"|"$/g, '') || '';
      });

      try {
        // Validate required fields
        if (!row.name) throw new Error('Name is required');
        if (!row.selling_price) throw new Error('Selling price is required');

        // Generate slug from name
        const slug = row.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

        // Find category ID if provided
        let categoryId = null;
        if (row.category) {
          const { data: category } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', row.category)
            .single();
          categoryId = category?.id;
        }

        // Insert product
        const { error: insertError } = await supabase.from('products').insert({
          name: row.name,
          slug,
          sku: row.sku || null,
          category_id: categoryId,
          selling_price_cents: parseInt(row.selling_price) || 0,
          compare_at_price_cents: parseInt(row.compare_price) || null,
          cost_price_cents: parseInt(row.cost_price) || null,
          stock_quantity: parseInt(row.stock) || 0,
          description: row.description || null,
          primary_image_url: row.image_url || null,
          status: 'active',
        });

        if (insertError) throw new Error(insertError.message);
        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({ row: i + 1, error: err.message });
      }
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ total: 0, success: 0, failed: 1, errors: [{ row: 0, error: err.message }] }, { status: 500 });
  }
}

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
