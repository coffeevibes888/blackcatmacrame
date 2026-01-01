'use client';

interface CloudinaryLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({ src, width, quality }: CloudinaryLoaderProps): string {
  // If it's already a Cloudinary URL, add transformations
  if (src.includes('res.cloudinary.com')) {
    // Extract parts of the Cloudinary URL
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      const transformations = `w_${width},q_${quality || 'auto'},f_auto`;
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
  }
  
  // If it's a local image (starts with /), return as-is
  if (src.startsWith('/')) {
    return src;
  }
  
  // For other external URLs (UploadThing, etc.), proxy through Cloudinary fetch
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName) {
    const transformations = `w_${width},q_${quality || 'auto'},f_auto`;
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodeURIComponent(src)}`;
  }
  
  // Fallback: return original URL
  return src;
}
