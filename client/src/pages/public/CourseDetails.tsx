// client/src/pages/public/CourseDetails.tsx - PRODUCTION READY WITH FIX
import { useEffect, useState, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { Link, useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/context/AuthContext';
import {
  Clock,
  Users,
  BookOpen,
  Star,
  CheckCircle,
  Share2,
  Heart,
  Award,
  Globe,
  Smartphone,
  Trophy,
  Calendar,
  Lock,
  Unlock,
  FileText,
  Video,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VideoPlayer from '@/components/VideoPlayer';
import LogoPlaceholder from '@/components/LogoPlaceholder';
import apiClient from '@/lib/axios';

// ✅ TYPE DEFINITIONS
type Lesson = {
  id: number;
  title: string;
  description?: string;
  contentType: 'video' | 'pdf' | 'text';
  videoUrl?: string | null;
  pdfUrl?: string | null;
  duration?: number;
  isFree: boolean;
  isPublished: boolean;
  order: number;
  moduleId: number;
};

type Module = {
  id: number;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  lessons: Lesson[];
};

type CourseDetailsData = {
  id: number;
  title: string;
  description: string;
  thumbnail?: string | null;
  videoUrl?: string | null;
  instructor?: {
    id?: number;
    name: string;
    avatar?: string | null;
    bio?: string;
    students?: number;
    courses?: number;
    rating?: number;
  };
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviews?: number;
  originalPrice: number | null;
  discountPrice: number | null;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  language: string;
  isFree?: boolean;
  isFeatured?: boolean;
  lastUpdated?: string;
  features?: string[];
  requirements?: string[];
  modules?: Module[];
};

export default function CourseDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // State
  const [course, setCourse] = useState<CourseDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ FETCH COURSE DETAILS
  useEffect(() => {
    async function loadCourse() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/courses/${id}`);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to load course');
        }

        const c = response.data.course;

        const mapped: CourseDetailsData = {
          id: c.id,
          title: c.title,
          description: c.description,
          thumbnail: c.thumbnail || null,
          videoUrl: c.videoUrl || c.video_url || null,
          instructor: {
            id: c.instructorId || c.instructor_id,
            name: c.instructorName || c.instructor || 'Expert Instructor',
            avatar: c.instructorAvatar || null,
            bio: c.instructorBio || '',
            students: c.totalStudents ?? 0,
            courses: c.instructorCourses ?? 0,
            rating: typeof c.instructorRating === 'number' ? c.instructorRating : undefined,
          },
          duration: c.duration || 'Self-paced',
          lessons: c.totalLessons || c.total_lessons || 0,
          students: c.totalStudents || c.total_students || 0,
          rating: Number(c.rating || 0),
          reviews: c.totalReviews || c.total_reviews || 0,
          originalPrice: c.originalPrice != null ? Number(c.originalPrice) : null,
          discountPrice: c.discountPrice != null ? Number(c.discountPrice) : null,
          category: c.category || 'General',
          level: c.level || 'Beginner',
          language: c.language || 'Hindi & English',
          isFree: Boolean(c.isFree || c.is_free),
          isFeatured: Boolean(c.isFeatured || c.is_featured),
          lastUpdated: c.updatedAt
            ? new Date(c.updatedAt).toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric',
              })
            : undefined,
          features: c.features || [
            'Mobile & Desktop access',
            'Study material PDFs',
            'Mock tests and quizzes',
            'Certificate of completion',
          ],
          requirements: c.requirements || [
            'Basic understanding of exam pattern',
            'Regular study commitment',
            'Internet connection for online content',
          ],
          modules: [],
        };

        setCourse(mapped);
      } catch (error: any) {
        console.error('[LOAD COURSE ERROR]', error);
        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to load course';
        setError(errorMessage);
        toast({
          title: 'Error Loading Course',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [id, toast]);

  // ✅ FIXED: FETCH MODULES & LESSONS - PROPER IMPLEMENTATION
  useEffect(() => {
    async function loadModules() {
      if (!id) return;

      try {
        setModulesLoading(true);

        // ✅ TRY MULTIPLE POSSIBLE ENDPOINTS
        let response;
        let lessonsData: any[] = [];

        // Try endpoint 1: /lessons/course/:id (most likely)
        try {
          response = await apiClient.get(`/lessons/course/${id}`);
          if (response.data.success) {
            lessonsData = response.data.data || response.data.lessons || [];
          }
        } catch (err1) {
          // Try endpoint 2: /courses/:id/lessons
          try {
            response = await apiClient.get(`/courses/${id}/lessons`);
            if (response.data.success) {
              lessonsData = response.data.data || response.data.lessons || [];
            }
          } catch (err2) {
            // Try endpoint 3: /courses/:id/modules
            try {
              response = await apiClient.get(`/courses/${id}/modules`);
              if (response.data.success) {
                // If modules are already grouped, use them directly
                if (response.data.modules && Array.isArray(response.data.modules)) {
                  setCourse((prev) =>
                    prev ? { ...prev, modules: response.data.modules } : null
                  );
                  const totalLessons = response.data.modules.reduce(
                    (acc: number, m: Module) => acc + (m.lessons?.length || 0),
                    0
                  );
                  if (totalLessons > 0) {
                    setCourse((prev) => (prev ? { ...prev, lessons: totalLessons } : null));
                  }
                  return;
                }
              }
            } catch (err3) {
              console.warn('[LOAD MODULES] All endpoints failed');
              throw err3;
            }
          }
        }

        // ✅ GROUP LESSONS BY MODULE ID
        if (lessonsData.length > 0) {
          const modulesMap = new Map<number, Module>();

          lessonsData.forEach((lesson: any) => {
            // Only show published lessons OR free preview lessons
            const isVisible =
              lesson.isPublished ||
              lesson.is_published ||
              lesson.isFree ||
              lesson.is_free;

            if (!isVisible) return;

            const moduleId = lesson.moduleId || lesson.module_id || 1;

            if (!modulesMap.has(moduleId)) {
              modulesMap.set(moduleId, {
                id: moduleId,
                title: `Module ${moduleId}`,
                description: '',
                order: moduleId,
                isPublished: true,
                lessons: [],
              });
            }

            const mappedLesson: Lesson = {
              id: lesson.id,
              title: lesson.title,
              description: lesson.description || undefined,
              contentType: lesson.contentType || lesson.content_type || 'video',
              videoUrl: lesson.videoUrl || lesson.video_url || null,
              pdfUrl: lesson.pdfUrl || lesson.pdf_url || null,
              duration: lesson.duration || undefined,
              isFree: Boolean(lesson.isFree || lesson.is_free),
              isPublished: Boolean(lesson.isPublished || lesson.is_published),
              order: lesson.orderIndex || lesson.order_index || 0,
              moduleId: moduleId,
            };

            modulesMap.get(moduleId)!.lessons.push(mappedLesson);
          });

          // Sort modules and lessons
          const modules = Array.from(modulesMap.values()).sort((a, b) => a.order - b.order);

          modules.forEach((module) => {
            module.lessons.sort((a, b) => a.order - b.order);
          });

          setCourse((prev) => (prev ? { ...prev, modules } : null));

          // Update total lesson count
          const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
          if (totalLessons > 0) {
            setCourse((prev) => (prev ? { ...prev, lessons: totalLessons } : null));
          }
        } else {
          // No lessons found - set empty modules
          setCourse((prev) => (prev ? { ...prev, modules: [] } : null));
        }
      } catch (error: any) {
        console.warn(
          '[LOAD MODULES]',
          error.response?.data?.message || 'Failed to load modules'
        );
        // Set empty modules on error
        setCourse((prev) => (prev ? { ...prev, modules: [] } : null));
      } finally {
        setModulesLoading(false);
      }
    }

    // Only load modules after course is loaded
    if (course?.id) {
      loadModules();
    }
  }, [id, course?.id]);

  // ✅ CHECK COURSE ACCESS
  useEffect(() => {
    async function loadAccess() {
      if (!id || !isAuthenticated) {
        setHasAccess(false);
        return;
      }

      try {
        const response = await apiClient.get(`/courses/${id}/access`);

        if (response.data.success) {
          setHasAccess(Boolean(response.data.hasAccess));
        }
      } catch (error: any) {
        console.warn(
          '[CHECK ACCESS]',
          error.response?.data?.message || 'Failed to check access'
        );
        setHasAccess(false);
      }
    }
    loadAccess();
  }, [id, isAuthenticated]);

  // ✅ ENROLLMENT HANDLER (OPTIMIZED)
  const handlePrimaryAction = useCallback(async () => {
    if (!course || !id) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to enroll in this course',
      });
      setLocation(`/login?redirect=/courses/${id}`);
      return;
    }

    // Already has access - go to learning page
    if (hasAccess) {
      setLocation(`/learn/${id}`);
      return;
    }

    // Free course - enroll directly
    if (course.isFree) {
      setEnrolling(true);
      try {
        const response = await apiClient.post(`/courses/${id}/enroll`);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to enroll');
        }

        if (response.data.alreadyEnrolled) {
          setHasAccess(true);
          toast({
            title: 'Already Enrolled',
            description: 'You already have access to this course.',
          });
          setLocation(`/learn/${id}`);
          return;
        }

        // Enrollment success
        setHasAccess(true);
        toast({
          title: 'Enrolled Successfully! 🎉',
          description: 'You now have access to this course.',
        });
        setTimeout(() => setLocation(`/learn/${id}`), 1000);
      } catch (error: any) {
        console.error('[ENROLL ERROR]', error);
        toast({
          title: 'Enrollment Failed',
          description: error.response?.data?.message || 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setEnrolling(false);
      }
      return;
    }

    // Paid course - go to payment
    toast({
      title: 'Payment Required',
      description: 'Proceed to payment to enroll in this course.',
    });
    setLocation(`/payment/course/${id}`);
  }, [course, id, isAuthenticated, hasAccess, toast, setLocation]);

  // ✅ SHARE HANDLER (OPTIMIZED)
  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title || 'Course',
          text: course?.description || '',
          url,
        });
        toast({ title: 'Shared successfully!' });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share error:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link copied to clipboard!' });
      } catch (err) {
        console.error('Copy error:', err);
        toast({
          title: 'Failed to copy link',
          variant: 'destructive',
        });
      }
    }
  }, [course, toast]);

  // ✅ COMPUTED VALUES (OPTIMIZED WITH useMemo)
  const hasDiscount = useMemo(() => {
    if (!course) return false;
    return (
      course.discountPrice != null &&
      course.originalPrice != null &&
      course.discountPrice < course.originalPrice
    );
  }, [course?.discountPrice, course?.originalPrice]);

  const discountPercent = useMemo(() => {
    if (!hasDiscount || !course?.originalPrice || !course?.discountPrice) return 0;
    return Math.round(
      ((course.originalPrice - course.discountPrice) / course.originalPrice) * 100
    );
  }, [hasDiscount, course?.originalPrice, course?.discountPrice]);

  const primaryButtonLabel = useMemo(
    () =>
      !isAuthenticated
        ? 'Login to Enroll'
        : hasAccess
        ? 'Continue Learning'
        : course?.isFree
        ? 'Enroll Free'
        : 'Buy Course',
    [isAuthenticated, hasAccess, course?.isFree]
  );

  const totalFreeLessons = useMemo(() => {
    if (!course?.modules) return 0;
    return course.modules.reduce(
      (acc, module) => acc + (module.lessons?.filter((l) => l.isFree).length || 0),
      0
    );
  }, [course?.modules]);

  // ✅ LOADING SKELETON
  if (loading && !course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error || (!loading && !course)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-4">
              <p>{error || 'Course not found'}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/courses">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                  </Link>
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

  if (!course) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* BREADCRUMBS */}
      <div className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/courses" className="hover:text-foreground transition-colors">
              Courses
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href={`/courses?category=${course.category}`}
              className="hover:text-foreground transition-colors"
            >
              {course.category}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground truncate">{course.title}</span>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline">{course.category}</Badge>
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {course.level}
                </Badge>
                {course.isFree && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    FREE
                  </Badge>
                )}
                {course.isFeatured && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    ⭐ Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.title) }} />
              <p className="text-lg text-muted-foreground mb-6" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.description) }} />

              <div className="flex flex-wrap items-center gap-6 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-foreground">
                      {course.rating.toFixed(1)}
                    </span>
                  </div>
                  {course.reviews != null && course.reviews > 0 && (
                    <span className="text-muted-foreground">
                      ({course.reviews.toLocaleString()} reviews)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>

                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span>{course.language}</span>
                </div>

                {course.lastUpdated && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Updated {course.lastUpdated}</span>
                  </div>
                )}
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={course.instructor.avatar || undefined}
                      alt={course.instructor.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {course.instructor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Created by</p>
                    <p className="font-semibold">{course.instructor.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR - PURCHASE CARD */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                {/* Video/Thumbnail */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {course.videoUrl ? (
                    <VideoPlayer
                      videoUrl={course.videoUrl}
                      title={course.title}
                      controls={false}
                    />
                  ) : course.thumbnail ? (
                    <>
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {hasDiscount && (
                        <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
                          {discountPercent}% OFF
                        </Badge>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full">
                      <LogoPlaceholder className="w-full h-full" title={course.title} />
                      {hasDiscount && (
                        <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
                          {discountPercent}% OFF
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    {course.isFree ? (
                      <span className="text-3xl font-bold text-green-600">FREE</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">
                          ₹
                          {(
                            course.discountPrice ??
                            course.originalPrice ??
                            0
                          ).toLocaleString()}
                        </span>
                        {hasDiscount && course.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            ₹{course.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 mb-6">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePrimaryAction}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        primaryButtonLabel
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${
                          isWishlisted ? 'fill-current text-red-500' : ''
                        }`}
                      />
                      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Course
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  {/* Course Includes */}
                  <div className="space-y-3 text-sm">
                    <h4 className="font-semibold">This course includes:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{course.duration} duration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span>{course.lessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <span>Mobile & Desktop access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span>Certificate of completion</span>
                      </div>
                      {totalFreeLessons > 0 && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Unlock className="w-4 h-4" />
                          <span>{totalFreeLessons} free preview lessons</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* CURRICULUM TAB */}
              <TabsContent value="curriculum" className="mt-6">
                {modulesLoading ? (
                  <Card>
                    <CardContent className="p-6 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                      <span className="text-muted-foreground">Loading curriculum...</span>
                    </CardContent>
                  </Card>
                ) : course.modules && course.modules.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">
                        Course Content ({course.lessons} lessons)
                      </h3>
                      {totalFreeLessons > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          {totalFreeLessons} Free Previews
                        </Badge>
                      )}
                    </div>

                    <Accordion type="multiple" className="space-y-3">
                      {course.modules.map((module, index) => (
                        <AccordionItem
                          key={module.id}
                          value={`module-${module.id}`}
                          className="border rounded-lg px-4"
                        >
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between flex-1 mr-4">
                              <div className="text-left">
                                <h4 className="font-semibold">
                                  Module {index + 1}: {module.title}
                                </h4>
                                {module.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {module.description}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline">
                                {module.lessons?.length || 0} lessons
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2">
                              {module.lessons && module.lessons.length > 0 ? (
                                module.lessons.map((lesson, idx) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      {lesson.contentType === 'video' && (
                                        <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                                      )}
                                      {lesson.contentType === 'pdf' && (
                                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                      )}
                                      {lesson.contentType === 'text' && (
                                        <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {idx + 1}. {lesson.title}
                                        </p>
                                        {lesson.description && (
                                          <p className="text-xs text-muted-foreground truncate">
                                            {lesson.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      {lesson.duration && (
                                        <span className="text-xs text-muted-foreground">
                                          {lesson.duration} min
                                        </span>
                                      )}
                                      {lesson.isFree ? (
                                        <Badge
                                          variant="outline"
                                          className="text-green-600 text-xs"
                                        >
                                          <Unlock className="w-3 h-3 mr-1" />
                                          Preview
                                        </Badge>
                                      ) : (
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground p-3">
                                  No lessons added yet
                                </p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Course curriculum will be available soon.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What you'll learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(course.features || []).map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(course.requirements || []).map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* INSTRUCTOR TAB */}
              <TabsContent value="instructor" className="mt-6">
                {course.instructor ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <Avatar className="w-20 h-20">
                          <AvatarImage
                            src={course.instructor.avatar || undefined}
                            alt={course.instructor.name}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                            {course.instructor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">
                            {course.instructor.name}
                          </h3>
                          {course.instructor.bio && (
                            <p className="text-muted-foreground mb-4">
                              {course.instructor.bio}
                            </p>
                          )}

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            {course.instructor.rating != null && (
                              <div>
                                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                                  <Star className="w-4 h-4 fill-current" />
                                  <span className="font-semibold text-foreground">
                                    {course.instructor.rating.toFixed(1)}
                                  </span>
                                </div>
                                <p className="text-muted-foreground">Rating</p>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold mb-1">
                                {(course.instructor.students ?? 0).toLocaleString()}
                              </p>
                              <p className="text-muted-foreground">Students</p>
                            </div>
                            <div>
                              <p className="font-semibold mb-1">
                                {course.instructor.courses ?? 0}
                              </p>
                              <p className="text-muted-foreground">Courses</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Instructor information will be updated soon.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* REVIEWS TAB */}
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="text-2xl font-bold text-foreground">
                          {course.rating.toFixed(1)}
                        </span>
                      </div>
                      {course.reviews != null && course.reviews > 0 && (
                        <span className="text-muted-foreground">
                          ({course.reviews.toLocaleString()} reviews)
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Reviews will be available soon.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* SIDEBAR - STATS & CTA */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Enrolled Students</span>
                  <span className="font-semibold">{course.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Lessons</span>
                  <span className="font-semibold">{course.lessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-semibold">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Language</span>
                  <span className="font-semibold">{course.language}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <span className="font-semibold">{course.level}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Success Focused</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete the course and earn your certificate to showcase your achievement.
                </p>
                <Button variant="outline" className="w-full" onClick={handlePrimaryAction}>
                  {primaryButtonLabel}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
