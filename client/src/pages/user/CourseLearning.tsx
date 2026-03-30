// client/src/pages/user/CourseLearning.tsx - PRODUCTION READY WITH FIX
import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PDFViewer from '@/components/PDFViewer';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  PlayCircle,
  FileText,
  CheckCircle,
  BookOpen,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import apiClient from '@/lib/axios';

type Lesson = {
  id: number;
  title: string;
  description?: string;
  contentType: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  duration?: number;
  orderIndex: number;
  moduleId: number;
  isFree: boolean;
  isCompleted: boolean;
  progressPercentage: number;
  lastPosition?: number;
};

type Module = {
  id: number;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: Lesson[];
};

type Course = {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
};

type Enrollment = {
  progress: number;
  completedLessons: number;
  lastAccessedAt?: string;
};

export default function CourseLearning() {
  const { courseId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // ✅ FIXED: FETCH COURSE CONTENT WITH PROPER ENDPOINT HANDLING
  useEffect(() => {
    async function fetchCourseContent() {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        // ✅ TRY MULTIPLE ENDPOINTS
        let response;
        let courseData = null;
        let enrollmentData = null;
        let lessonsData: any[] = [];

        // Try endpoint 1: /lessons/course/:id
        try {
          response = await apiClient.get(`/lessons/course/${courseId}`);
          console.log('📦 Lessons API Response:', response.data);

          if (response.data.success) {
            courseData = response.data.course;
            enrollmentData = response.data.enrollment;
            
            // Check if lessons are already grouped in modules
            if (response.data.modules && Array.isArray(response.data.modules)) {
              setModules(response.data.modules);
              setCourse(courseData);
              setEnrollment(enrollmentData);

              // Auto-select first incomplete lesson
              const firstIncompleteLesson = response.data.modules
                .flatMap((m: Module) => m.lessons)
                .find((l: Lesson) => !l.isCompleted);

              const firstLesson = response.data.modules[0]?.lessons[0];
              setSelectedLesson(firstIncompleteLesson || firstLesson || null);
              return;
            } else if (response.data.data || response.data.lessons) {
              lessonsData = response.data.data || response.data.lessons;
            }
          }
        } catch (err1) {
          console.warn('[ENDPOINT 1 FAILED] Trying alternative endpoint...');
          
          // Try endpoint 2: /courses/:id/lessons
          try {
            response = await apiClient.get(`/courses/${courseId}/lessons`);
            console.log('📦 Lessons API Response (Alt):', response.data);

            if (response.data.success) {
              lessonsData = response.data.data || response.data.lessons || [];
            }
          } catch (err2) {
            console.error('[ALL ENDPOINTS FAILED]', err2);
            throw new Error('Unable to load course content. Please try again later.');
          }
        }

        // ✅ FETCH COURSE DETAILS SEPARATELY IF NOT PROVIDED
        if (!courseData) {
          try {
            const courseResponse = await apiClient.get(`/courses/${courseId}`);
            if (courseResponse.data.success) {
              courseData = courseResponse.data.course;
            }
          } catch (err) {
            console.warn('[COURSE DETAILS FETCH FAILED]', err);
          }
        }

        // ✅ GROUP LESSONS BY MODULE
        if (lessonsData.length > 0) {
          const modulesMap = new Map<number, Module>();

          lessonsData.forEach((lesson: any) => {
            const moduleId = lesson.moduleId || lesson.module_id || 1;

            if (!modulesMap.has(moduleId)) {
              modulesMap.set(moduleId, {
                id: moduleId,
                title: `Module ${moduleId}`,
                description: '',
                orderIndex: moduleId,
                lessons: [],
              });
            }

            const mappedLesson: Lesson = {
              id: lesson.id,
              title: lesson.title,
              description: lesson.description || undefined,
              contentType: lesson.contentType || lesson.content_type || 'video',
              videoUrl: lesson.videoUrl || lesson.video_url || undefined,
              pdfUrl: lesson.pdfUrl || lesson.pdf_url || undefined,
              textContent: lesson.textContent || lesson.text_content || undefined,
              duration: lesson.duration || undefined,
              orderIndex: lesson.orderIndex || lesson.order_index || 0,
              moduleId: moduleId,
              isFree: Boolean(lesson.isFree || lesson.is_free),
              isCompleted: Boolean(lesson.isCompleted || lesson.is_completed),
              progressPercentage: lesson.progressPercentage || lesson.progress_percentage || 0,
              lastPosition: lesson.lastPosition || lesson.last_position || undefined,
            };

            modulesMap.get(moduleId)!.lessons.push(mappedLesson);
          });

          // Sort modules and lessons
          const groupedModules = Array.from(modulesMap.values()).sort(
            (a, b) => a.orderIndex - b.orderIndex
          );

          groupedModules.forEach((module) => {
            module.lessons.sort((a, b) => a.orderIndex - b.orderIndex);
          });

          setModules(groupedModules);

          // Auto-select first incomplete lesson or first lesson
          const allLessons = groupedModules.flatMap((m) => m.lessons);
          const firstIncompleteLesson = allLessons.find((l) => !l.isCompleted);
          const firstLesson = allLessons[0];
          setSelectedLesson(firstIncompleteLesson || firstLesson || null);
        } else {
          // No lessons found
          setError('No lessons available for this course yet.');
        }

        setCourse(courseData);
        setEnrollment(enrollmentData);
      } catch (error: any) {
        console.error('[FETCH COURSE CONTENT ERROR]', error);
        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to load course content';
        setError(errorMessage);
        toast({
          title: 'Failed to load course',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCourseContent();
  }, [courseId, toast]);

  // ✅ MARK LESSON COMPLETE
  const handleMarkComplete = useCallback(async () => {
    if (!selectedLesson) return;

    try {
      const response = await apiClient.post(`/lessons/${selectedLesson.id}/progress`, {
        isCompleted: true,
        progressPercentage: 100,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update progress');
      }

      // Update local state
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === selectedLesson.id
              ? { ...l, isCompleted: true, progressPercentage: 100 }
              : l
          ),
        }))
      );

      setSelectedLesson((prev) => (prev ? { ...prev, isCompleted: true } : null));

      if (enrollment) {
        setEnrollment({
          ...enrollment,
          progress: response.data.progress?.overallProgress || enrollment.progress,
          completedLessons: response.data.progress?.completedLessons || enrollment.completedLessons + 1,
        });
      }

      toast({
        title: 'Lesson Completed! 🎉',
        description: 'Great job! Keep learning.',
      });
    } catch (error: any) {
      console.error('[MARK COMPLETE ERROR]', error);
      toast({
        title: 'Failed to mark as complete',
        description: error.response?.data?.message || error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [selectedLesson, enrollment, toast]);

  const handleBack = () => {
    setLocation('/dashboard');
  };

  const getLessonIcon = (contentType: string) => {
    if (contentType === 'video') return PlayCircle;
    if (contentType === 'pdf') return FileText;
    return BookOpen;
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-4">
              <p>{error || 'Course not found or you do not have access.'}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="font-semibold text-lg">{course.title}</h1>
              <p className="text-sm text-muted-foreground">
                {enrollment?.completedLessons || 0} of {totalLessons} lessons completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={enrollment?.progress || 0} className="w-32" />
            <span className="text-sm font-medium">{enrollment?.progress || 0}%</span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)] flex-col lg:flex-row">
        {/* Sidebar - Curriculum */}
        <aside className="w-full lg:w-80 border-r bg-card overflow-hidden flex flex-col h-[300px] lg:h-full order-2 lg:order-1">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Course Content</h2>
            {totalLessons > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{totalLessons} lessons</p>
            )}
          </div>
          <ScrollArea className="flex-1">
            {modules.length > 0 ? (
              <div className="p-4 space-y-4">
                {modules.map((module) => (
                  <div key={module.id}>
                    <h3 className="font-medium mb-2 text-sm uppercase text-muted-foreground">
                      {module.title}
                    </h3>
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => {
                        const LessonIcon = getLessonIcon(lesson.contentType);
                        const isActive = selectedLesson?.id === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <LessonIcon
                                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                  isActive ? '' : 'text-muted-foreground'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{lesson.title}</p>
                                {lesson.duration && (
                                  <p
                                    className={`text-xs ${
                                      isActive
                                        ? 'text-primary-foreground/80'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {lesson.duration} min
                                  </p>
                                )}
                              </div>
                              {lesson.isCompleted && (
                                <CheckCircle
                                  className={`w-4 h-4 flex-shrink-0 ${
                                    isActive ? '' : 'text-green-500'
                                  }`}
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No lessons available yet</p>
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto order-1 lg:order-2">
          {selectedLesson ? (
            <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedLesson.title}</h2>
                  {selectedLesson.description && (
                    <p className="text-muted-foreground">{selectedLesson.description}</p>
                  )}
                </div>
                {selectedLesson.isCompleted ? (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </Badge>
                ) : (
                  <Button onClick={handleMarkComplete} size="sm">
                    Mark as Complete
                  </Button>
                )}
              </div>

              <Separator />

              {/* VIDEO PLAYER */}
              {selectedLesson.contentType === 'video' && selectedLesson.videoUrl && (
                <Card className="overflow-hidden border-0 shadow-lg bg-black">
                  <CardContent className="p-0">
                    <VideoPlayer
                      videoUrl={selectedLesson.videoUrl}
                      title={selectedLesson.title}
                      controls={false}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              )}

            {/* PDF Viewer - REPLACE THE OLD IFRAME WITH THIS */}
{selectedLesson.contentType === 'pdf' && selectedLesson.pdfUrl && (
  <Card className="overflow-hidden border-0 shadow-lg">
    <CardContent className="p-0 h-[800px]">
      <PDFViewer 
        pdfUrl={selectedLesson.pdfUrl} 
        title={selectedLesson.title}
        className="w-full h-full"
      />
    </CardContent>
  </Card>
)}

              {/* Text Content */}
              {selectedLesson.contentType === 'text' && selectedLesson.textContent && (
                <Card>
                  <CardContent className="p-6 prose dark:prose-invert max-w-none">
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: selectedLesson.textContent }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Select a lesson to start learning</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
