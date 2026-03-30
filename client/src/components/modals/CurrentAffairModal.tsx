// client/src/components/modals/CurrentAffairModal.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  X,
  Calendar,
  Tag,
  Eye,
  ExternalLink,
  Share2,
} from 'lucide-react';
import type { CurrentAffair } from '@/services/currentAffairsApi';

interface CurrentAffairModalProps {
  affair: CurrentAffair;
  onClose: () => void;
}

export default function CurrentAffairModal({
  affair,
  onClose,
}: CurrentAffairModalProps) {
  const getImportanceBadge = (importance: string) => {
    switch (importance?.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: affair.title,
          text: affair.summary || affair.title,
          url: window.location.href,
        })
        .catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-background z-10 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline">{affair.category}</Badge>
                {affair.importance && getImportanceBadge(affair.importance)}
              </div>
              <h2 className="text-2xl font-bold mb-2">{affair.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {affair.date
                    ? new Date(affair.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {affair.views} views
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {affair.thumbnail && (
            <div className="w-full h-64 overflow-hidden rounded-lg">
              <img
                src={affair.thumbnail}
                alt={affair.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {affair.summary && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">{affair.summary}</p>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Detailed Information</h3>
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {affair.content}
            </div>
          </div>

          {Array.isArray(affair.tags) && affair.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {affair.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {(affair.source || affair.sourceUrl) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Source</h3>
                <div className="flex items-center gap-2">
                  {affair.source && (
                    <span className="text-sm text-muted-foreground">
                      {affair.source}
                    </span>
                  )}
                  {affair.sourceUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(affair.sourceUrl!, '_blank')}
                    >
                      Visit Source
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
