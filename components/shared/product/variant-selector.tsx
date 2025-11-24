'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { Decimal } from '@prisma/client/runtime/library';
import AddToCart from './add-to-cart';
import { Cart, CartItem } from '@/types';
import ProductPrice from '@/components/shared/product/product-price';

type Variant = {
  id: string;
  sku?: string | null;
  price: string | number | Decimal;
  stock?: number;
  images?: string[];
  printfulExternalId?: string | null;
  color?: { id: string; name: string; slug: string; hex?: string | null; createdAt?: Date; active?: boolean } | null;
  size?: { id: string; name: string; slug: string; createdAt?: Date; active?: boolean } | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  images?: string[];
};

export default function VariantSelector({
  variants,
  product,
  cart,
  onColorSelected,
}: {
  variants: Variant[];
  product: Product;
  cart?: Cart;
  onColorSelected?: (colorSlug: string | undefined, colorName: string | undefined) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();

  useEffect(() => {
    setMounted(true);
  }, []);

  const colors = useMemo(() => {
    let filtered = variants;
    if (selectedSize) {
      filtered = filtered.filter((v) => v.size?.slug === selectedSize);
    }
    const map = new Map<string, { id: string; name: string; slug: string; hex?: string | null }>();
    filtered.forEach((v) => {
      if (v.color) map.set(v.color.slug, v.color);
    });
    return Array.from(map.values());
  }, [variants, selectedSize]);

  const sizes = useMemo(() => {
    let filtered = variants;
    if (selectedColor) {
      filtered = filtered.filter((v) => v.color?.slug === selectedColor);
    }
    const map = new Map<string, { id: string; name: string; slug: string }>();
    filtered.forEach((v) => {
      if (v.size) map.set(v.size.slug, v.size);
    });
    return Array.from(map.values());
  }, [variants, selectedColor]);

  const selectedVariant = useMemo(() => {
    let filtered = variants;
    
    if (selectedColor) {
      filtered = filtered.filter((v) => v.color?.slug === selectedColor);
    }
    
    if (selectedSize) {
      filtered = filtered.filter((v) => v.size?.slug === selectedSize);
    }
    
    console.log('[VariantSelector] Selected variant:', filtered[0]);
    return filtered[0];
  }, [variants, selectedColor, selectedSize]);

  // Use the first image from the selected variant to show the color variation
  const variantImage = selectedVariant?.images?.[0];
  const productImage = product.images?.[0];
  const image = variantImage || productImage;
  
  console.log('[VariantSelector] Image to display:', image);
  console.log('[VariantSelector] Variant images:', selectedVariant?.images);

  const item: CartItem = {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    qty: 1,
    image: image || '',
    price: Number(selectedVariant?.price ?? product.price),
    variantId: selectedVariant?.id,
    variantColor: selectedVariant?.color?.name,
    variantSize: selectedVariant?.size?.name,
  } as unknown as CartItem;

  const hasRequiredSelections = () => {
    if (!selectedVariant) return false;
    if (colors.length === 0 && sizes.length === 0) return true;
    if (colors.length > 0 && !selectedColor) return false;
    if (sizes.length > 0 && !selectedSize) return false;
    return true;
  };

  const shouldShowButton = hasRequiredSelections();
  const shouldShowMessage = !hasRequiredSelections();

  useEffect(() => {
    if (onColorSelected && selectedColor) {
      const colorName = colors.find(c => c.slug === selectedColor)?.name;
      console.log('[VariantSelector] Color changed to:', selectedColor, colorName);
      onColorSelected(selectedColor, colorName);
    } else if (onColorSelected && !selectedColor) {
      // Color was deselected
      onColorSelected(undefined, undefined);
    }
  }, [selectedColor, onColorSelected, colors]);

  if (!mounted) {
    return null;
  }

  return (
    <div className='space-y-4'>
      {colors.length > 0 && (
        <div>
          <label className='block text-sm font-medium mb-1'>Color</label>
          <select
            className='w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            value={selectedColor || ''}
            onChange={(e) => {
              const newColor = e.target.value || undefined;
              console.log('[VariantSelector] Color dropdown changed:', newColor);
              setSelectedColor(newColor);
            }}
          >
            <option value=''>Select color</option>
            {colors.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <label className='block text-sm font-medium mb-1'>Size</label>
          <select
            className='w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            value={selectedSize || ''}
            onChange={(e) => {
              const newSize = e.target.value || undefined;
              console.log('[VariantSelector] Size dropdown changed:', newSize);
              setSelectedSize(newSize);
            }}
          >
            <option value=''>Select size</option>
            {sizes.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <ProductPrice value={Number(selectedVariant?.price ?? product.price)} />
      </div>

      {shouldShowButton ? (
        <div>
          <AddToCart cart={cart} item={item} />
        </div>
      ) : shouldShowMessage ? (
        <p className='text-sm text-gray-500'>Please select color and size</p>
      ) : null}
    </div>
  );
}