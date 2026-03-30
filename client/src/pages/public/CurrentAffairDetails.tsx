// client/src/pages/public/CurrentAffairDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Tag,
  Eye,
  ArrowLeft,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getCurrentAffair,
  type CurrentAffair,
} from '@/services/currentAffairsApi';

export default function CurrentAffairDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [affair, setAffair] = useState<CurrentAffair | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAffair();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAffair = async () => {
    try {
      setLoading(true);
      const res = await getCurrentAffair(Number(id));
      setAffair(res.item);
    } catch (error: any) {
      console.error('Failed to fetch current affair:', error);
      toast({
        title: 'Error',
        description: 'Failed to load current affair details',
        variant: 'destructive',
      });
      setLocation('/current-affairs');
    } finally {
      setLoading(false);
    }
  };

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
          title: affair?.title,
          text: affair?.summary || affair?.title,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Article link copied to clipboard',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading article...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!affair) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Article not found</p>
            <Button onClick={() => setLocation('/current-affairs')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Current Affairs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation('/current-affairs')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Current Affairs
        </Button>

        <Card>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant="outline">{affair.category}</Badge>
                {affair.importance && getImportanceBadge(affair.importance)}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {affair.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
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

            {affair.thumbnail && (
              <div className="w-full overflow-hidden rounded-lg">
                <img
                  src={affair.thumbnail}
                  alt={affair.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {affair.summary && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-base font-medium leading-relaxed">
                  {affair.summary}
                </p>
              </div>
            )}

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Detailed Information
              </h2>
              <div
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none leading-relaxed"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {affair.content}
              </div>
            </div>

            {Array.isArray(affair.tags) && affair.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
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
                  <h3 className="text-lg font-semibold mb-3">Source</h3>
                  <div className="flex flex-wrap items-center gap-3">
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
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Article
              </Button>
              <Button
                className="flex-1"
                onClick={() => setLocation('/current-affairs')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
