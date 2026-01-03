'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ImportMode = 'skip' | 'update';

export default function ProductExportImport() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>('skip');
  const [importResult, setImportResult] = useState<{
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/super-admin/products/export');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ description: 'Products exported successfully!' });
    } catch {
      toast({ variant: 'destructive', description: 'Export failed. Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', importMode);

      const response = await fetch('/api/super-admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setImportResult({
        created: result.created,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors || [],
      });

      toast({ description: result.message });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Import failed';
      toast({ variant: 'destructive', description: msg });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Product Export / Import
        </CardTitle>
        <CardDescription>
          Export all products to CSV or import products from a CSV file. Images are stored as URLs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Section */}
        <div className="flex items-center gap-4">
          <Button onClick={handleExport} disabled={exporting} variant="outline">
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export All Products (CSV)
          </Button>
        </div>

        <hr className="my-4" />

        {/* Import Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Import Mode:</label>
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as ImportMode)}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              <option value="skip">Skip existing (by slug)</option>
              <option value="update">Update existing (by slug)</option>
            </select>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            variant="outline"
          >
            {importing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import Products (CSV)
          </Button>

          <p className="text-xs text-muted-foreground">
            CSV must have headers: name, slug, category, brand, description, price, stock, images (JSON array of URLs), etc.
          </p>
        </div>

        {/* Import Results */}
        {importResult && (
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <p className="font-medium mb-2">Import Results:</p>
            <ul className="space-y-1">
              <li>✅ Created: {importResult.created}</li>
              <li>🔄 Updated: {importResult.updated}</li>
              <li>⏭️ Skipped: {importResult.skipped}</li>
            </ul>
            {importResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-destructive font-medium">Errors:</p>
                <ul className="text-xs text-destructive">
                  {importResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>...and {importResult.errors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
