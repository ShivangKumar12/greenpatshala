// client/src/components/instructor/tabs/InstructorFeedback.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InstructorFeedback() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedbacks');
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load feedbacks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1">Student Feedback</h2>
        <p className="text-muted-foreground">Reviews and ratings from your students</p>
      </div>

      {/* Average Rating Card */}
      <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-4xl font-bold">4.6</p>
                <div className="flex">{renderStars(5)}</div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {feedbacks.length} reviews
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <ThumbsUp className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading feedback...</div>
      ) : feedbacks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
            <p className="text-muted-foreground">
              Student reviews will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback: any) => (
            <Card key={feedback.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {feedback.userName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{feedback.userName || 'Anonymous'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(feedback.rating || 0)}</div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline">{feedback.courseName}</Badge>
                    </div>
                    <p className="text-sm">{feedback.comment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
