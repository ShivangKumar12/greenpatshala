// client/src/components/PDFViewer.tsx - FIXED LOADING
import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  className?: string;
}

export default function PDFViewer({ pdfUrl, title, className = '' }: PDFViewerProps) {
  const [scale, setScale] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const zoomIn = () => setScale((prev) => Math.min(prev + 25, 200));
  const zoomOut = () => setScale((prev) => Math.max(prev - 25, 50));
  const resetZoom = () => setScale(100);

  const pdfViewerUrl = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=${scale}`;

  // ✅ FIX: Auto-hide loading after 3 seconds
  useEffect(() => {
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pdfUrl]);

  return (
    <div className={`relative w-full h-full bg-gray-100 dark:bg-gray-900 flex flex-col ${className}`}>
      {/* Zoom Controls - Fixed Position */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 border">
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomOut}
          disabled={scale <= 50}
          className="h-8 w-8 p-0"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <button
          onClick={resetZoom}
          className="text-sm font-medium px-2 min-w-[50px] text-center hover:text-primary transition-colors"
          title="Reset Zoom"
        >
          {scale}%
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={zoomIn}
          disabled={scale >= 200}
          className="h-8 w-8 p-0"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
          <div className="text-center">
            <p className="text-red-500 font-semibold mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">Please check the file or try again</p>
          </div>
        </div>
      )}

      {/* PDF Iframe - Full Height */}
      <iframe
        key={pdfViewerUrl}
        src={pdfViewerUrl}
        title={title || 'PDF Viewer'}
        className="w-full h-full border-0 flex-1"
      />
    </div>
  );
}
