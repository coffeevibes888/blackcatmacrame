'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductExportButtonProps {
  productId: string;
  productSlug?: string;
}

export default function ProductExportButton({ productId, productSlug }: ProductExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/super-admin/products/export?id=${productId}`);
      
      if (response.status === 401) {
        toast({ variant: 'destructive', description: 'Only SuperAdmin can export products' });
        return;
      }
      
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productSlug || productId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ description: 'Product exported as ZIP with images!' });
    } catch {
      toast({ variant: 'destructive', description: 'Export failed' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm" title="Export ZIP with images">
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
