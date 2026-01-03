import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import JSZip from 'jszip';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'superAdmin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    // Fetch products - single or all
    const products = await prisma.product.findMany({
      where: productId ? { id: productId } : undefined,
      include: {
        variants: {
          include: {
            color: true,
            size: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (productId && products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // For single product export, create a ZIP with CSV + images
    if (productId && products.length === 1) {
      const product = products[0];
      const zip = new JSZip();
      
      // Download and add images to zip
      const imageFilenames: string[] = [];
      for (let i = 0; i < product.images.length; i++) {
        const imageUrl = product.images[i];
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
            const filename = `image-${i + 1}.${ext}`;
            zip.file(`images/${filename}`, buffer);
            imageFilenames.push(filename);
          }
        } catch (err) {
          console.error(`Failed to download image: ${imageUrl}`, err);
          imageFilenames.push(imageUrl); // Keep original URL if download fails
        }
      }

      // Download banner if exists
      let bannerFilename = '';
      if (product.banner) {
        try {
          const response = await fetch(product.banner);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            const ext = product.banner.split('.').pop()?.split('?')[0] || 'jpg';
            bannerFilename = `banner.${ext}`;
            zip.file(`images/${bannerFilename}`, buffer);
          }
        } catch (err) {
          console.error(`Failed to download banner`, err);
          bannerFilename = product.banner;
        }
      }

      const sizeIds = product.variants
        .map((v) => v.sizeId)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);
      const colorIds = product.variants
        .map((v) => v.colorId)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);

      // Create product data JSON (easier to parse than CSV for single product)
      const productData = {
        name: product.name,
        slug: product.slug,
        category: product.category,
        subCategory: product.subCategory || '',
        brand: product.brand,
        description: product.description,
        price: Number(product.price),
        stock: product.stock,
        rating: Number(product.rating),
        numReviews: product.numReviews,
        images: imageFilenames,
        imageColors: product.imageColors,
        isFeatured: product.isFeatured,
        banner: bannerFilename,
        onSale: product.onSale,
        salePercent: product.salePercent ? Number(product.salePercent) : null,
        saleDiscountType: product.saleDiscountType,
        saleUntil: product.saleUntil ? product.saleUntil.toISOString() : null,
        sizeIds,
        colorIds,
      };

      zip.file('product.json', JSON.stringify(productData, null, 2));

      const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
      
      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${product.slug}.zip"`,
        },
      });
    }

    // CSV headers
    const headers = [
      'id',
      'name',
      'slug',
      'category',
      'subCategory',
      'brand',
      'description',
      'price',
      'stock',
      'rating',
      'numReviews',
      'images',
      'imageColors',
      'isFeatured',
      'banner',
      'onSale',
      'salePercent',
      'saleDiscountType',
      'saleUntil',
      'sizeIds',
      'colorIds',
      'createdAt',
    ];

    // Helper to escape CSV values
    const escapeCSV = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV rows
    const rows = products.map((product) => {
      const sizeIds = product.variants
        .map((v) => v.sizeId)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);
      const colorIds = product.variants
        .map((v) => v.colorId)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);

      return [
        escapeCSV(product.id),
        escapeCSV(product.name),
        escapeCSV(product.slug),
        escapeCSV(product.category),
        escapeCSV(product.subCategory),
        escapeCSV(product.brand),
        escapeCSV(product.description),
        escapeCSV(Number(product.price)),
        escapeCSV(product.stock),
        escapeCSV(Number(product.rating)),
        escapeCSV(product.numReviews),
        escapeCSV(JSON.stringify(product.images)),
        escapeCSV(JSON.stringify(product.imageColors)),
        escapeCSV(product.isFeatured),
        escapeCSV(product.banner),
        escapeCSV(product.onSale),
        escapeCSV(product.salePercent ? Number(product.salePercent) : ''),
        escapeCSV(product.saleDiscountType),
        escapeCSV(product.saleUntil ? product.saleUntil.toISOString() : ''),
        escapeCSV(JSON.stringify(sizeIds)),
        escapeCSV(JSON.stringify(colorIds)),
        escapeCSV(product.createdAt.toISOString()),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = productId 
      ? `product-${products[0].slug}-${new Date().toISOString().split('T')[0]}.csv`
      : `products-export-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
