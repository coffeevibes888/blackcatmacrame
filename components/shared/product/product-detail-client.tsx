'use client';

import { useState, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ProductPrice from '@/components/shared/product/product-price';
import ProductImages from '@/components/shared/product/product-images';
import VariantSelector from '@/components/shared/product/variant-selector';
import Rating from '@/components/shared/product/rating';
import { Cart } from '@/types';

type Variant = {
  id: string;
  price: number;
  images?: string[];
  color?: { id: string; name: string; slug: string } | null;
  size?: { id: string; name: string; slug: string } | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  rating: number;
  numReviews: number;
  price: number;
  stock: number;
  images: string[];
  variants?: Variant[];
};

export default function ProductDetailClient({
  product,
  cart,
}: {
  product: Product;
  cart?: Cart;
}) {
  const baseImages = useMemo(() => product.images || [], [product.images]);
  
  const [activeImage, setActiveImage] = useState<string | undefined>(baseImages[0]);
  const [activeColorName, setActiveColorName] = useState<string | undefined>();

  // Use all base images for thumbnails; only the main image changes with color selection
  const allImages = Array.from(new Set(baseImages));

  // Function to handle color selection and update main image
  const handleColorSelected = useCallback((colorSlug: string | undefined, colorName: string | undefined) => {
    console.log('[ProductDetailClient] Color selected:', colorSlug, colorName);
    
    setActiveColorName(colorName);
    
    // Find the variant with this color and get its first image
    if (colorSlug) {
      const variantWithColor = (product.variants || []).find((v) => v.color?.slug === colorSlug);
      const firstColorImage = variantWithColor?.images?.[0];
      
      console.log('[ProductDetailClient] Switching to color variant image:', firstColorImage);
      
      if (firstColorImage) {
        setActiveImage(firstColorImage);
      }
    } else {
      // If no color selected, reset to base image
      setActiveImage(baseImages[0]);
    }
  }, [product.variants, baseImages]);

  const handleImageChange = useCallback((url: string | undefined) => {
    console.log('[ProductDetailClient] Thumbnail clicked, changing image to:', url);
    setActiveImage(url);
  }, []);

  return (
    <section>
      <div className='grid grid-cols-1 md:grid-cols-5'>
        {/* Images Column */}
        <div className='col-span-2'>
          <ProductImages 
            images={allImages} 
            activeImage={activeImage}
            onImageClick={handleImageChange}
            colorName={activeColorName}
          />
        </div>

        {/* Details Column */}
        <div className='col-span-2 p-5'>
          <div className='flex flex-col gap-6'>
            <p>
              {product.brand} {product.category}
            </p>
            <h1 className='h3-bold'>{product.name}</h1>
            <Rating value={Number(product.rating)} />
            <p>{product.numReviews} reviews</p>
            <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
              <ProductPrice
                value={Number(product.price)}
                className='w-24 rounded-full bg-green-100 text-green-700 px-5 py-2'
              />
            </div>
          </div>
          <div className='mt-10'>
            <p className='font-semibold'>Description</p>
            <p>{product.description}</p>
          </div>
        </div>

        {/* Action Column */}
        <div>
          <Card>
            <CardContent className='p-4'>
              <div className='mb-2 flex justify-between'>
                <div>Price</div>
                <div>
                  <ProductPrice value={Number(product.price)} />
                </div>
              </div>
              <div className='mb-2 flex justify-between'>
                <div>Status</div>
                {product.stock > 0 ? (
                  <Badge variant='outline'>In Stock</Badge>
                ) : (
                  <Badge variant='destructive'>Out Of Stock</Badge>
                )}
              </div>
              {product.stock > 0 && (
                <div className='flex-center'>
                  <div className='w-full'>
                    <VariantSelector
                      variants={product.variants || []}
                      product={product}
                      cart={cart}
                      onColorSelected={handleColorSelected}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
