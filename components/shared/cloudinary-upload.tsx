'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus } from 'lucide-react';

interface CloudinaryUploadProps {
  onUpload: (urls: string[]) => void;
  multiple?: boolean;
}

interface CloudinaryResult {
  info: {
    secure_url: string;
  };
}

const CloudinaryUpload = ({ onUpload, multiple = true }: CloudinaryUploadProps) => {
  return (
    <CldUploadWidget
      uploadPreset="macrame_unsigned"
      options={{
        multiple,
        maxFiles: 10,
        resourceType: 'image',
        folder: 'macrame-products',
      }}
      onSuccess={(result) => {
        const res = result as CloudinaryResult;
        if (res?.info?.secure_url) {
          onUpload([res.info.secure_url]);
        }
      }}
    >
      {({ open }) => (
        <Button
          type="button"
          variant="outline"
          onClick={() => open()}
          className="w-full"
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Upload Images
        </Button>
      )}
    </CldUploadWidget>
  );
};

export default CloudinaryUpload;
