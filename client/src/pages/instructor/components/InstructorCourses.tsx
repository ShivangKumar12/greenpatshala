// client/src/components/instructor/tabs/InstructorCourses.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus, 
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  IndianRupee 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InstructorCourses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]); // ← Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Courses API response:', data); // Debug log
        
        // Handle different API response formats
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else if (data.data && Array.isArray(data.data)) {
          setCourses(data.data);
        } else {
          console.error('Unexpected API response format:', data);
          setCourses([]);
        }
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
      setCourses([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Safe filter with array check
  const filteredCourses = Array.isArray(courses) 
    ? courses.filter((course: any) =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Manage Courses</h2>
          <p className="text-muted-foreground">Create and manage your course content</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Course
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading courses...</div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try a different search' : 'Create your first course to get started'}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: any) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={course.status === 'Active' ? 'default' : 'secondary'}>
                    {course.status || 'Draft'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {course.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{course.enrollments || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    <span>{course.price || 0}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
