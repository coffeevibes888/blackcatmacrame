'use client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useRef } from 'react';
import { productDefaultValues } from '@/lib/constants';
import { insertProductSchema, updateProductSchema } from '@/lib/validators';
import { Product } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import slugify from 'slugify';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { createProduct, updateProduct } from '@/lib/actions/product.actions';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';
import { Checkbox } from '../ui/checkbox';
import { z } from 'zod';
import { ImagePlus, FolderUp, Loader2, FolderInput } from 'lucide-react';
import JSZip from 'jszip';

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: 'Create' | 'Update';
  product?: Product;
  productId?: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver:
      type === 'Update'
        ? zodResolver(updateProductSchema)
        : zodResolver(insertProductSchema),
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
  });

  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (
    values
  ) => {
    let res;
    if (type === 'Create') {
      res = await createProduct(values);
    } else if (productId) {
      res = await updateProduct({ ...values, id: productId });
    }

    if (!res?.success) {
      toast({
        variant: 'destructive',
        description: res?.message || 'Something went wrong',
      });
    } else {
      toast({ description: res.message });
      router.push('/admin/products');
    }
  };

  const images = (form.watch('images') as string[]) || [];
  const imageColors = (form.watch('imageColors') as string[]) || [];
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const isFeatured = form.watch('isFeatured');
  const banner = form.watch('banner');
  const [sizes, setSizes] = useState<{ id: string; name: string; slug: string }[]>([]);
  const saleDiscountType = form.watch('saleDiscountType') ?? 'percentage';
  const [uploading, setUploading] = useState(false);
  const [importingFolder, setImportingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const importZipRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      toast({ variant: 'destructive', description: 'Cloudinary not configured' });
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'macrame_unsigned');
    formData.append('folder', 'macrame-products');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) return data.secure_url;
      throw new Error(data.error?.message || 'Upload failed');
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleBulkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newUrls: string[] = [];
    const newColors: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const url = await uploadToCloudinary(file);
      if (url) {
        newUrls.push(url);
        newColors.push('');
      }
    }

    if (newUrls.length > 0) {
      form.setValue('images', [...images, ...newUrls]);
      form.setValue('imageColors', [...imageColors, ...newColors]);
      toast({ description: `Uploaded ${newUrls.length} image(s)` });
    }
    setUploading(false);
  };

  const handleBannerUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const url = await uploadToCloudinary(files[0]);
    if (url) {
      form.setValue('banner', url);
      toast({ description: 'Banner uploaded' });
    }
    setUploading(false);
  };

  const handleOnSaleChange = (v: boolean | 'indeterminate') => {
    const checked = Boolean(v);
    form.setValue('onSale', checked, { shouldValidate: true });
    if (checked) {
      const currentSalePercent = form.getValues('salePercent');
      if (currentSalePercent === undefined || Number.isNaN(currentSalePercent)) {
        form.setValue('salePercent', 10, { shouldValidate: true });
      }
      const currentType = form.getValues('saleDiscountType');
      if (!currentType) {
        form.setValue('saleDiscountType', 'percentage', { shouldValidate: true });
      }
    } else {
      form.setValue('salePercent', undefined, { shouldValidate: true });
      form.setValue('saleUntil', null, { shouldValidate: true });
    }
  };

  // Import from exported ZIP folder
  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingFolder(true);
    try {
      const zip = await JSZip.loadAsync(file);
      
      // Read product.json
      const productJsonFile = zip.file('product.json');
      if (!productJsonFile) {
        toast({ variant: 'destructive', description: 'Invalid export: missing product.json' });
        return;
      }

      const productData = JSON.parse(await productJsonFile.async('string'));

      // Upload images from zip to Cloudinary
      const uploadedImages: string[] = [];
      const imageFiles = Object.keys(zip.files).filter(f => f.startsWith('images/') && !f.endsWith('/'));
      
      for (const imagePath of imageFiles) {
        const imageFile = zip.file(imagePath);
        if (!imageFile) continue;
        
        const imageData = await imageFile.async('blob');
        const filename = imagePath.split('/').pop() || 'image.jpg';
        const imageFileObj = new File([imageData], filename, { type: `image/${filename.split('.').pop()}` });
        
        // Skip banner for now, handle separately
        if (filename.startsWith('banner')) continue;
        
        const url = await uploadToCloudinary(imageFileObj);
        if (url) uploadedImages.push(url);
      }

      // Upload banner if exists
      let bannerUrl: string | null = null;
      const bannerFile = imageFiles.find(f => f.includes('banner'));
      if (bannerFile) {
        const bannerData = await zip.file(bannerFile)?.async('blob');
        if (bannerData) {
          const filename = bannerFile.split('/').pop() || 'banner.jpg';
          const bannerFileObj = new File([bannerData], filename, { type: `image/${filename.split('.').pop()}` });
          bannerUrl = await uploadToCloudinary(bannerFileObj);
        }
      }

      // Populate form with imported data
      form.setValue('name', productData.name || '');
      form.setValue('slug', productData.slug || '');
      form.setValue('category', productData.category || '');
      form.setValue('subCategory', productData.subCategory || '');
      form.setValue('brand', productData.brand || '');
      form.setValue('description', productData.description || '');
      form.setValue('price', productData.price || 0);
      form.setValue('stock', productData.stock || 0);
      form.setValue('images', uploadedImages);
      form.setValue('imageColors', productData.imageColors || []);
      form.setValue('isFeatured', productData.isFeatured || false);
      form.setValue('banner', bannerUrl);
      form.setValue('onSale', productData.onSale || false);
      if (productData.salePercent) form.setValue('salePercent', productData.salePercent);
      if (productData.saleDiscountType) form.setValue('saleDiscountType', productData.saleDiscountType);
      if (productData.saleUntil) form.setValue('saleUntil', productData.saleUntil);
      if (productData.sizeIds) form.setValue('sizeIds', productData.sizeIds);

      toast({ description: `Imported "${productData.name}" with ${uploadedImages.length} images!` });
    } catch (err) {
      console.error('Import error:', err);
      toast({ variant: 'destructive', description: 'Failed to import product folder' });
    } finally {
      setImportingFolder(false);
      if (importZipRef.current) importZipRef.current.value = '';
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/sizes');
        if (res.ok) setSizes(await res.json());
      } catch (err) {
        console.error('Error fetching sizes:', err);
      }
    })();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* -------------------- Import from Exported Folder -------------------- */}
        {type === 'Create' && (
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <input
                  ref={importZipRef}
                  type="file"
                  accept=".zip"
                  onChange={handleImportZip}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={importingFolder}
                  onClick={() => importZipRef.current?.click()}
                  className="gap-2"
                >
                  {importingFolder ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FolderInput className="h-4 w-4" />
                  )}
                  Import from Exported Folder (.zip)
                </Button>
                <span className="text-xs text-muted-foreground">
                  Upload a previously exported product ZIP to auto-fill this form
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* -------------------- Name & Slug -------------------- */}
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'name'> }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'slug'> }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter slug" {...field} />
                    <Button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2"
                      onClick={() =>
                        form.setValue(
                          'slug',
                          slugify(form.getValues('name'), { lower: true })
                        )
                      }
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* -------------------- Category, Sub Category & Brand -------------------- */}
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="category"
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'category'> }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subCategory"
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'subCategory'> }) => (
              <FormItem className="w-full">
                <FormLabel>Sub Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter sub category (e.g. T-shirt, Hoodie, Hat)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'brand'> }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* -------------------- Price, Stock & Sale -------------------- */}
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="price"
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'price'> }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'stock'> }) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder="Enter stock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* -------------------- Images Upload with Color Labels -------------------- */}
        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem className="w-full">
              <FormLabel>Images & Colors</FormLabel>
              <Card>
                <CardContent className="space-y-4 mt-2 min-h-48">
                  <div className="flex flex-wrap gap-4">
                    {images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="flex flex-col items-start space-y-2 cursor-move"
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={() => {
                          if (dragIndex === null || dragIndex === index) return;
                          const nextImages = [...images];
                          const [movedImage] = nextImages.splice(dragIndex, 1);
                          nextImages.splice(index, 0, movedImage);

                          const nextColors = [...imageColors];
                          const [movedColor] = nextColors.splice(dragIndex, 1);
                          nextColors.splice(index, 0, movedColor);

                          form.setValue('images', nextImages);
                          form.setValue('imageColors', nextColors);
                          setDragIndex(null);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <Image
                            src={image}
                            alt="product image"
                            className="w-20 h-20 object-cover object-center rounded-sm"
                            width={100}
                            height={100}
                          />
                          <button
                            type="button"
                            className="text-xs text-red-600 hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              const nextImages = images.filter((_, i) => i !== index);
                              const nextColors = imageColors.filter((_, i) => i !== index);
                              form.setValue('images', nextImages);
                              form.setValue('imageColors', nextColors);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                        <Input
                          placeholder="Color for this image (e.g. Black, Red, Navy)"
                          value={imageColors[index] || ''}
                          onChange={(e) => {
                            const next = [...imageColors];
                            next[index] = e.target.value;
                            form.setValue('imageColors', next);
                          }}
                          className="w-20"
                        />
                      </div>
                    ))}
                  </div>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {/* Hidden file inputs */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleBulkUpload(e.target.files)}
                      />
                      <input
                        ref={folderInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        // @ts-expect-error webkitdirectory is not in types
                        webkitdirectory=""
                        className="hidden"
                        onChange={(e) => handleBulkUpload(e.target.files)}
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="mr-2 h-4 w-4" />
                        )}
                        Upload Images
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        onClick={() => folderInputRef.current?.click()}
                      >
                        {uploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FolderUp className="mr-2 h-4 w-4" />
                        )}
                        Upload Folder
                      </Button>
                    </div>
                  </FormControl>
                </CardContent>
              </Card>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* -------------------- Available Sizes -------------------- */}
        <div className="mb-4">
          <FormLabel>Available Sizes</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {sizes.map((s) => {
              const checked =
                (form.getValues('sizeIds') || []).includes(s.id);
              return (
                <label
                  key={s.id}
                  className="inline-flex items-center space-x-1 text-xs px-2 py-1 border rounded-md"
                >
                  <input
                    type="checkbox"
                    className="h-3 w-3"
                    checked={checked}
                    onChange={(e) => {
                      const current = form.getValues('sizeIds') || [];
                      form.setValue(
                        'sizeIds',
                        e.target.checked
                          ? [...current, s.id]
                          : current.filter((id: string) => id !== s.id)
                      );
                    }}
                  />
                  <span>{s.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* -------------------- Sale -------------------- */}
        <div className="mb-4">
          <FormLabel>Sale</FormLabel>
          <div className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={form.watch('onSale')}
              onCheckedChange={handleOnSaleChange}
            />
            <span>On Sale</span>
          </div>
          {form.watch('onSale') && (
            <div className="mt-2 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <select
                  className="border rounded px-2 py-1 text-xs bg-background"
                  value={saleDiscountType}
                  onChange={(e) => form.setValue('saleDiscountType', e.target.value as 'percentage' | 'amount')}
                >
                  <option value="percentage">% off</option>
                  <option value="amount">$ off</option>
                </select>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder={saleDiscountType === 'percentage' ? '10' : '5'}
                  value={form.watch('salePercent') ?? ''}
                  onChange={(e) =>
                    form.setValue(
                      'salePercent',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-20"
                />
                <span>{saleDiscountType === 'percentage' ? '% off' : '$ off'}</span>
              </div>
              <Input
                type="datetime-local"
                value={form.watch('saleUntil') ?? ''}
                onChange={(e) => form.setValue('saleUntil', e.target.value || null)}
                className="text-xs"
              />
            </div>
          )}
        </div>

        {/* -------------------- Featured Product -------------------- */}
        <div className="mb-4">
          <FormLabel>Featured Product</FormLabel>
          <Card>
            <CardContent className="space-y-2 mt-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'isFeatured'> }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Is Featured?</FormLabel>
                  </FormItem>
                )}
              />
              {isFeatured && banner && (
                <Image
                  src={banner}
                  alt="banner image"
                  className="w-full object-cover object-center rounded-sm"
                  width={1920}
                  height={680}
                />
              )}
              {isFeatured && !banner && (
                <>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleBannerUpload(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="mr-2 h-4 w-4" />
                    )}
                    Upload Banner
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* -------------------- Description -------------------- */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'description'> }) => (
            <FormItem className="w-full">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* -------------------- Submit Button -------------------- */}
        <div>
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? 'Submitting...' : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
