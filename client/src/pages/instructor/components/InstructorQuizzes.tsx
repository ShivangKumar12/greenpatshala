// client/src/components/instructor/tabs/InstructorQuizzes.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileQuestion, 
  Plus, 
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InstructorQuizzes() {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<any[]>([]); // ← Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quizzes');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Quizzes API response:', data); // Debug log
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setQuizzes(data);
        } else if (data.quizzes && Array.isArray(data.quizzes)) {
          setQuizzes(data.quizzes);
        } else if (data.data && Array.isArray(data.data)) {
          setQuizzes(data.data);
        } else {
          console.error('Unexpected API response format:', data);
          setQuizzes([]);
        }
      } else {
        throw new Error('Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quizzes',
        variant: 'destructive',
      });
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe filter
  const filteredQuizzes = Array.isArray(quizzes)
    ? quizzes.filter((quiz: any) =>
        quiz.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Manage Quizzes</h2>
          <p className="text-muted-foreground">Create and manage quiz assessments</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Quiz
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search quizzes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading quizzes...</div>
      ) : filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileQuestion className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try a different search' : 'Create your first quiz to assess students'}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz: any) => (
            <Card key={quiz.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileQuestion className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{quiz.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {quiz.description || 'No description'}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                          <span>{quiz.totalQuestions || 0} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{quiz.timeLimit || 0} mins</span>
                        </div>
                        <Badge variant="secondary">
                          {quiz.attempts || 0} attempts
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
