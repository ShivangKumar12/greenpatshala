// client/src/components/LockedPDFPreview.tsx - FIXED LOADING STATE
import { useState, useEffect } from 'react';
import { Lock, ShoppingCart, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LockedPDFPreviewProps {
  pdfUrl: string;
  title: string;
  price: number;
  discountPrice?: number;
  category: string;
  subject: string;
  totalPages?: number;
  onPurchase: () => void;
}

export default function LockedPDFPreview({
  pdfUrl,
  title,
  price,
  discountPrice,
  category,
  subject,
  totalPages,
  onPurchase,
}: LockedPDFPreviewProps) {
  const [loading, setLoading] = useState(true);

  const finalPrice = discountPrice || price;
  const hasDiscount = discountPrice !== undefined && discountPrice < price;

  // Show first page only, no scrolling
  const pdfViewerUrl = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&zoom=fit&view=FitH`;

  // ✅ FIX: Auto-hide loading after 2 seconds (iframe onLoad is unreliable)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [pdfUrl]);

  return (
    <div className="relative w-full h-full bg-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Loading State - Fixed Duration */}
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-white">Loading preview...</p>
          </div>
        </div>
      )}

      {/* PDF First Page */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <iframe
          src={pdfViewerUrl}
          title={`${title} - Preview`}
          className="w-full h-full border-0"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {/* Gradient Blur Overlay - Top Clear, Bottom Blurred */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 45%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Bottom Half - Strong Blur */}
      <div
        className="absolute left-0 right-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: '50%',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)',
        }}
      />

      {/* Lock Message - Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/95 to-transparent pt-32 pb-8 px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Lock Icon Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-full mb-4 border-2 border-primary/40">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Unlock Full Content</h3>

          {/* Description */}
          <p className="text-gray-300 text-sm sm:text-base mb-6 max-w-lg mx-auto">
            You're viewing a preview. Purchase to access all {totalPages ? `${totalPages} pages` : 'content'} and
            download the complete PDF.
          </p>

          {/* Price & Purchase */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            {/* Price */}
            <div className="flex items-center gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-white">₹{discountPrice}</span>
                  <span className="text-lg line-through text-gray-400">₹{price}</span>
                  <Badge className="bg-green-600 text-white border-0">
                    {Math.round(((price - discountPrice!) / price) * 100)}% OFF
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-white">₹{price}</span>
              )}
            </div>

            {/* Purchase Button */}
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 h-12 shadow-lg"
              onClick={onPurchase}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Buy Now
            </Button>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400 flex-wrap">
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {category}
            </Badge>
            <span>•</span>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {subject}
            </Badge>
            {totalPages && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {totalPages} pages
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
