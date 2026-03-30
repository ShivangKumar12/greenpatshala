// client/src/components/modals/CurrentAffairDetailsModal.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Calendar, 
  Tag, 
  Share2,
  Bookmark,
  Download,
  ExternalLink
} from 'lucide-react';

interface CurrentAffairDetailsModalProps {
  affair: {
    id: string;
    title: string;
    category: string;
    date: string;
    excerpt: string;
    content: string;
    tags: string[];
    source?: string;
    sourceUrl?: string;
    imageUrl?: string;
    relatedTopics?: string[];
    keyPoints?: string[];
  };
  onClose: () => void;
}

export default function CurrentAffairDetailsModal({ affair, onClose }: CurrentAffairDetailsModalProps) {
  const handleDownloadPDF = () => {
    // todo: remove mock functionality - generate PDF
    console.log('Downloading PDF...');
  };

  const handleShare = () => {
    // todo: remove mock functionality - implement share functionality
    if (navigator.share) {
      navigator.share({
        title: affair.title,
        text: affair.excerpt,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-background z-10 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge>{affair.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {affair.date}
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">{affair.title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-affair-modal">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Featured Image */}
          {affair.imageUrl && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={affair.imageUrl} 
                alt={affair.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Key Points */}
          {affair.keyPoints && affair.keyPoints.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Key Points
              </h3>
              <ul className="space-y-2">
                {affair.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {affair.content}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          {affair.tags && affair.tags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Related Tags</h4>
              <div className="flex flex-wrap gap-2">
                {affair.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Topics */}
          {affair.relatedTopics && affair.relatedTopics.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Related Topics</h4>
              <div className="flex flex-wrap gap-2">
                {affair.relatedTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          {affair.source && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="font-semibold text-sm">{affair.source}</p>
              </div>
              {affair.sourceUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => window.open(affair.sourceUrl, '_blank')}
                  data-testid="button-view-source"
                >
                  View Source
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleDownloadPDF}
              data-testid="button-download-affair-pdf"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              data-testid="button-bookmark-affair"
            >
              <Bookmark className="w-4 h-4" />
              Bookmark
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleShare}
              data-testid="button-share-affair"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
