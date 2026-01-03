import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

// Parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++; // Skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Parse JSON safely
function safeParseJSON(str: string, fallback: unknown = []): unknown {
  if (!str || str === '""' || str === '') return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'superAdmin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mode = formData.get('mode') as string || 'skip'; // 'skip', 'update', or 'replace'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 });
    }

    const headers = parseCSVLine(lines[0]);
    const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header.trim()] = values[idx]?.trim() || '';
        });

        // Check if product exists by slug
        const existingProduct = await prisma.product.findFirst({
          where: { slug: row.slug },
        });

        if (existingProduct && mode === 'skip') {
          results.skipped++;
          continue;
        }

        const images = safeParseJSON(row.images, []) as string[];
        const imageColors = safeParseJSON(row.imageColors, []) as string[];
        const sizeIds = safeParseJSON(row.sizeIds, []) as string[];

        const productData = {
          name: row.name,
          slug: row.slug,
          category: row.category,
          subCategory: row.subCategory || null,
          brand: row.brand,
          description: row.description,
          price: parseFloat(row.price) || 0,
          stock: parseInt(row.stock) || 0,
          images,
          imageColors,
          isFeatured: row.isFeatured === 'true',
          banner: row.banner || null,
          onSale: row.onSale === 'true',
          salePercent: row.salePercent ? parseFloat(row.salePercent) : null,
          saleDiscountType: (row.saleDiscountType as 'percentage' | 'amount') || 'percentage',
          saleUntil: row.saleUntil ? new Date(row.saleUntil) : null,
        };

        if (existingProduct && mode === 'update') {
          // Update existing product
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData,
          });

          // Update variants if sizeIds provided
          if (sizeIds.length > 0) {
            await prisma.productVariant.deleteMany({ where: { productId: existingProduct.id } });
            await prisma.productVariant.createMany({
              data: sizeIds.map((sizeId) => ({
                productId: existingProduct.id,
                sizeId,
                price: productData.price,
                stock: productData.stock,
                images,
              })),
            });
          }

          results.updated++;
        } else {
          // Create new product
          const created = await prisma.product.create({
            data: {
              ...productData,
              rating: parseFloat(row.rating) || 0,
              numReviews: parseInt(row.numReviews) || 0,
            },
          });

          // Create variants if sizeIds provided
          if (sizeIds.length > 0) {
            await prisma.productVariant.createMany({
              data: sizeIds.map((sizeId) => ({
                productId: created.id,
                sizeId,
                price: productData.price,
                stock: productData.stock,
                images,
              })),
            });
          }

          results.created++;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        results.errors.push(`Row ${i + 1}: ${errorMsg}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import complete: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`,
      ...results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
