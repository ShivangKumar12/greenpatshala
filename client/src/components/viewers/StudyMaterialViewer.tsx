// client/src/components/viewers/StudyMaterialViewer.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Lock
} from 'lucide-react';

interface StudyMaterialViewerProps {
  material: {
    id: string;
    title: string;
    subject: string;
    category: string;
    fileType: 'PDF' | 'DOC' | 'PPT';
    fileUrl?: string;
    isPaid: boolean;
    isUnlocked: boolean;
    totalPages?: number;
    description: string;
  };
  onClose: () => void;
}

export default function StudyMaterialViewer({ material, onClose }: StudyMaterialViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const totalPages = material.totalPages || 1;
  const progress = (currentPage / totalPages) * 100;

  const handleDownload = () => {
    if (!material.isUnlocked) {
      // todo: remove mock functionality - redirect to purchase
      return;
    }
    // todo: remove mock functionality - implement download
    console.log('Downloading material...');
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(prev => prev + 10);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(prev => prev - 10);
    }
  };

  if (!material.isUnlocked) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Study Material Locked</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{material.title}</h3>
            <p className="text-muted-foreground mb-6">
              This study material is part of a premium course. Purchase the course to access this content.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
              <Button data-testid="button-unlock-material">
                Unlock Material
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-viewer">
              <X className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{material.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{material.subject}</Badge>
                <Badge variant="secondary" className="text-xs">{material.fileType}</Badge>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 border-r pr-4 mr-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                data-testid="button-zoom-out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[50px] text-center">{zoom}%</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                data-testid="button-zoom-in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              className="gap-2"
              onClick={handleDownload}
              data-testid="button-download-material"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <Progress value={progress} className="h-1" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Page {currentPage} of {totalPages}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="min-h-full flex items-center justify-center p-8">
          {material.fileUrl ? (
            <div 
              className="bg-background shadow-lg rounded-lg overflow-hidden transition-transform"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {/* Embedded viewer or iframe for PDF */}
              <div className="aspect-[8.5/11] w-[612px] bg-white dark:bg-gray-900 p-8">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {/* todo: remove mock functionality - implement actual PDF viewer */}
                    PDF Viewer will be displayed here
                  </p>
                  <p className="text-xs mt-2">
                    Page {currentPage} content would be rendered here
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Material content not available</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t bg-background">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
              className="w-16 text-center border rounded px-2 py-1 text-sm"
              data-testid="input-page-number"
            />
            <span className="text-sm text-muted-foreground">of {totalPages}</span>
          </div>

          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            data-testid="button-next-page"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
