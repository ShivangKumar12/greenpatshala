// client/src/pages/public/Home.tsx - PRODUCTION READY WITH TRANSLATIONS
import { Link } from 'wouter';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import CourseCard from '@/components/cards/CourseCard';
import QuizCard from '@/components/cards/QuizCard';
import { AnimatedSection, StaggeredChildren } from '@/components/AnimatedSection';
import { useScrollAnimation, useAnimatedCounter } from '@/hooks/useScrollAnimation';
import {
  GraduationCap,
  BookOpen,
  FileQuestion,
  Briefcase,
  Trophy,
  CheckCircle,
  ArrowRight,
  Star,
  Play,
  Loader2,
  Target,
  Users,
  Award,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import heroImage from '@/assets/generated_images/students_celebrating_exam_success.png';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { submitFeedback, getPublicFeedbacks, type Feedback } from '@/services/feedbackApi';
import { getTestimonials, type Testimonial } from '@/services/testimonialApi';
import { getAllQuizzes } from '@/services/quizApi';
import apiClient from '@/lib/axios';

// Animated counter component for stats
const AnimatedCounter = ({ value, isActive }: { value: string; isActive: boolean }) => {
  const display = useAnimatedCounter(value, isActive, 1800);
  return <>{display}</>;
};

// Stats section with animated counters
const StatsSection = ({ stats, t }: { stats: any[]; t: (key: string) => string }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <section className="py-16 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat: any, index: number) => (
            <div
              key={index}
              className={`text-center ${isVisible ? 'animate-fadeInUp' : ''}`}
              style={{ opacity: isVisible ? undefined : 0, animationDelay: `${index * 150}ms` }}
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center animate-float">
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-3xl md:text-4xl font-bold mb-1">
                <AnimatedCounter value={stat.value} isActive={isVisible} />
              </p>
              <p className="text-sm md:text-base opacity-90">{t(stat.labelKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// AUTO-SCROLL CAROUSEL COMPONENT
// ============================================
interface AutoScrollCarouselProps {
  children: React.ReactNode;
  speed?: number;
  bgClass?: string;
}

const AutoScrollCarousel = ({ children, speed = 20, bgClass = 'from-white dark:from-background' }: AutoScrollCarouselProps) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="relative">
      {/* Gradient fade masks on edges */}
      <div className={`absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r ${bgClass} to-transparent z-10 pointer-events-none`} />
      <div className={`absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l ${bgClass} to-transparent z-10 pointer-events-none`} />

      <div className="overflow-hidden px-4">
        <div
          className="flex gap-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            animation: `scroll ${speed}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {children}
          {children}
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================
// VERTICAL AUTO-SCROLL CAROUSEL COMPONENT
// ============================================
interface VerticalAutoScrollProps {
  children: React.ReactNode;
  speed?: number;
  bgClass?: string;
  heightClass?: string;
}

const VerticalAutoScroll = ({ children, speed = 25, bgClass = 'from-muted/50 dark:from-background', heightClass = 'h-[500px]' }: VerticalAutoScrollProps) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className={`relative ${heightClass} overflow-hidden rounded-xl`}>
      {/* Top and Bottom Fade Masks */}
      <div className={`absolute top-0 left-0 right-0 h-16 bg-gradient-to-b ${bgClass} to-transparent z-10 pointer-events-none`} />
      <div className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t ${bgClass} to-transparent z-10 pointer-events-none`} />

      <div
        className="flex flex-col gap-4 pt-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          animation: `scrollY ${speed}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {children}
        {children}
      </div>
      <style>{`
        @keyframes scrollY {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(-50% - 8px)); } /* accounting for gap */
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================
// TYPES
// ============================================
interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  instructor: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  originalPrice: number;
  discountPrice?: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isFree?: boolean;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  questionsCount: number;
  duration: number;
  passingScore: number;
  attempts: number;
  originalPrice: number;
  discountPrice?: number;
  isFree: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage(); // ✅ USE LANGUAGE CONTEXT

  // Backend state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [publicFeedbacks, setPublicFeedbacks] = useState<Feedback[]>([]);
  const [popularCourses, setPopularCourses] = useState<CourseData[]>([]);
  const [popularQuizzes, setPopularQuizzes] = useState<QuizData[]>([]);

  // Loading states
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Feedback form state
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Static data with translation keys
  const features = useMemo(() => [
    {
      icon: Target,
      titleKey: 'features.focusedLearning',
      descKey: 'features.focusedLearningDesc',
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      icon: Users,
      titleKey: 'features.expertMentorship',
      descKey: 'features.expertMentorshipDesc',
      color: 'bg-teal-500/10 text-teal-600',
    },
    {
      icon: FileQuestion,
      titleKey: 'features.practiceTests',
      descKey: 'features.practiceTestsDesc',
      color: 'bg-green-600/10 text-green-700',
    },
    {
      icon: TrendingUp,
      titleKey: 'features.trackProgress',
      descKey: 'features.trackProgressDesc',
      color: 'bg-lime-500/10 text-lime-600',
    },
  ], []);

  const benefits = [
    { icon: Zap, title: 'Learn at Your Pace', description: 'Access courses 24/7 from anywhere. Study when it suits you best.' },
    { icon: Shield, title: 'Quality Guaranteed', description: '100% updated content aligned with latest exam patterns and syllabus.' },
    { icon: Award, title: 'Certificates', description: 'Earn completion certificates to showcase your skills and dedication.' },
    { icon: Clock, title: 'Lifetime Access', description: 'One-time payment for unlimited access to course materials forever.' },
  ];

  const stats = useMemo(() => [
    { value: '50,000+', labelKey: 'home.studentsEmpowered', icon: Users },
    { value: '500+', labelKey: 'home.expertCourses', icon: BookOpen },
    { value: '98%', labelKey: 'home.studentSatisfaction', icon: Trophy },
    { value: '10,000+', labelKey: 'home.successStories', icon: Award },
  ], []);

  const examCategories = [
    'UPSC (IAS/IPS/IFS)',
    'SSC (CGL/CHSL/MTS)',
    'Banking (IBPS/SBI/RBI)',
    'Railways (RRB/RRC)',
    'State PSCs',
    'Defence (NDA/CDS)',
    'Teaching (CTET/TET)',
    'Police & Services',
  ];

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  useEffect(() => {
    fetchTestimonials();
    fetchPublicFeedbacks();
    fetchPopularCourses();
    fetchPopularQuizzes();
  }, []);

  // ============================================
  // FETCH FUNCTIONS
  // ============================================
  const fetchTestimonials = useCallback(async () => {
    try {
      setLoadingTestimonials(true);
      const response = await getTestimonials(10);
      setTestimonials(response.testimonials || []);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  }, []);

  const fetchPublicFeedbacks = useCallback(async () => {
    try {
      setLoadingFeedbacks(true);
      const response = await getPublicFeedbacks(5);
      setPublicFeedbacks(response.feedbacks || []);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
      setPublicFeedbacks([]);
    } finally {
      setLoadingFeedbacks(false);
    }
  }, []);

  const fetchPopularCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const response = await apiClient.get('/courses');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load courses');
      }

      const courses = (response.data.courses || [])
        .map((c: any) => ({
          id: String(c.id),
          title: c.title,
          description: c.description,
          thumbnail: c.thumbnail,
          instructor: c.instructor || 'Expert Instructor',
          duration: c.duration,
          lessons: c.totalLessons || c.total_lessons || 0,
          students: c.totalStudents || c.total_students || 0,
          rating: Number(c.rating || 0),
          originalPrice: Number(c.originalPrice || c.original_price || 0),
          discountPrice: Number(c.discountPrice || c.discount_price || 0) || undefined,
          category: c.category,
          level: c.level as any,
          isFree: c.isFree || c.is_free === 1 || c.is_free === true,
        }))
        .sort((a: CourseData, b: CourseData) => b.students - a.students)
        .slice(0, 10);

      setPopularCourses(courses);
    } catch (error: any) {
      console.error('Fetch popular courses error:', error);
      setPopularCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  const fetchPopularQuizzes = useCallback(async () => {
    try {
      setLoadingQuizzes(true);
      const response = await getAllQuizzes();

      if (!response.success) {
        throw new Error(response.message || 'Failed to load quizzes');
      }

      const quizzes = (response.quizzes || [])
        .filter((q: any) => q.is_published === 1 || q.is_published === true)
        .map((q: any) => ({
          id: String(q.id),
          title: q.title,
          description: q.description || 'Practice quiz for competitive exams',
          thumbnail: q.thumbnail,
          category: q.category,
          questionsCount: q.total_marks || 50,
          duration: q.duration,
          passingScore: q.passing_marks || q.passingMarks,
          attempts: q.total_attempts || 0,
          originalPrice: Number(q.price || q.originalPrice || 0),
          discountPrice: q.discount_price ? Number(q.discount_price) : q.discountPrice,
          isFree: q.isFree || q.is_free === 1 || Number(q.price) === 0,
          difficulty: (q.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
        }))
        .sort((a: QuizData, b: QuizData) => b.attempts - a.attempts)
        .slice(0, 10);

      setPopularQuizzes(quizzes);
    } catch (error) {
      console.error('Fetch popular quizzes error:', error);
      setPopularQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  }, []);

  // ============================================
  // FEEDBACK HANDLER
  // ============================================
  const handleSubmitFeedback = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!feedbackMessage.trim()) {
        toast({
          title: t('feedback.feedbackSubmitted'),
          description: 'Please write your feedback before submitting.',
          variant: 'destructive',
        });
        return;
      }

      try {
        setSubmittingFeedback(true);
        await submitFeedback({
          name: feedbackName.trim() || undefined,
          message: feedbackMessage.trim(),
          rating: feedbackRating,
        });

        toast({
          title: t('feedback.thankYou'),
          description: t('feedback.feedbackSubmitted'),
        });

        setFeedbackName('');
        setFeedbackMessage('');
        setFeedbackRating(5);

        fetchPublicFeedbacks();
      } catch (error: any) {
        toast({
          title: t('common.error'),
          description: error.response?.data?.message || 'Failed to submit feedback',
          variant: 'destructive',
        });
      } finally {
        setSubmittingFeedback(false);
      }
    },
    [feedbackName, feedbackMessage, feedbackRating, toast, t, fetchPublicFeedbacks]
  );

  // ============================================
  // MEMOIZED VALUES
  // ============================================
  const getStartedHref = useMemo(() => {
    if (!isAuthenticated) return '/register';
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'instructor') return '/instructor';
    return '/dashboard';
  }, [isAuthenticated, user?.role]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Students celebrating government exam success"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-black/75 to-emerald-900/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-emerald-500/20 text-emerald-100 border-emerald-400/30 backdrop-blur-sm animate-fadeInUp">
              <Sparkles className="w-3 h-3 mr-1" />
              India's Most Trusted Government Exam Platform
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight animate-fadeInUp delay-100">
              {t('home.heroTitle')}
              <span style={{ color: '#76ff03' }}> {t('home.heroTitleHighlight')}</span>
              <br />
              {t('home.heroSubtitle')}
            </h1>

            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl animate-fadeInUp delay-200">
              {t('home.heroDescription')}
            </p>

            <div className="flex flex-wrap gap-4 mb-10 animate-fadeInUp delay-300">
              <Link href="/courses">
                <Button size="lg" className="gap-2 text-base px-8 py-6 animate-pulseGlow">
                  {t('home.startLearning')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/quizzes">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 text-base px-8 py-6"
                >
                  <Play className="w-5 h-5" />
                  {t('home.takeFreeTest')}
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-white/90 animate-fadeInUp delay-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">{t('home.trustIndicator1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">{t('home.trustIndicator2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">{t('home.trustIndicator3')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* Stats Section */}
      <StatsSection stats={stats} t={t} />

      {/* Exam Categories */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-8">
              <h3 className="text-xl md:text-2xl font-bold">{t('exams.comprehensive')}</h3>
            </div>
          </AnimatedSection>
          <StaggeredChildren
            animation="scaleIn"
            stagger={60}
            className="flex flex-wrap justify-center gap-3"
          >
            {examCategories.map((exam, index) => (
              <Badge key={index} variant="secondary" className="text-sm px-4 py-2 hover:bg-primary/10 hover:text-primary transition-colors cursor-default">
                {exam}
              </Badge>
            ))}
          </StaggeredChildren>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Target className="w-3 h-3 mr-1" />
              {t('home.whyChoose')}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('home.whyChooseSubtitle')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Comprehensive preparation platform trusted by lakhs of students across India
            </p>
          </AnimatedSection>

          <StaggeredChildren
            animation="fadeInUp"
            stagger={120}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <Card key={index} className="premium-card text-center border-2 hover:border-primary/50 transition-all">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-6`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{t(feature.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </StaggeredChildren>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection animation="fadeInUp" className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <Badge variant="outline" className="mb-4">
                <BookOpen className="w-3 h-3 mr-1" />
                {t('courses.title')}
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-2">{t('home.popularCourses')}</h2>
              <p className="text-muted-foreground text-lg">
                {loadingCourses ? t('common.loading') : `${popularCourses.length} ${t('courses.title').toLowerCase()} • ${t('home.hoverToPause')}`}
              </p>
            </div>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="gap-2">
                {t('home.viewAllCourses')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </AnimatedSection>

          {loadingCourses ? (
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-[380px] flex-shrink-0">
                  <Card>
                    <CardContent className="p-4">
                      <div className="h-48 bg-muted rounded mb-4 animate-pulse" />
                      <div className="h-4 bg-muted rounded mb-2 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : popularCourses.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">{t('common.noData')}</p>
              </CardContent>
            </Card>
          ) : (
            <AutoScrollCarousel speed={30} bgClass="from-gray-50 dark:from-muted/50">
              {popularCourses.map((course) => (
                <div key={course.id} className="w-[380px] flex-shrink-0">
                  <CourseCard {...course} />
                </div>
              ))}
            </AutoScrollCarousel>
          )}
        </div>
      </section>

      {/* Popular Quizzes */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection animation="fadeInUp" className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <Badge variant="outline" className="mb-4">
                <FileQuestion className="w-3 h-3 mr-1" />
                {t('quizzes.title')}
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-2">{t('home.trendingTests')}</h2>
              <p className="text-muted-foreground text-lg">
                {loadingQuizzes ? t('common.loading') : `${popularQuizzes.length} tests • Real exam patterns`}
              </p>
            </div>
            <Link href="/quizzes">
              <Button size="lg" variant="outline" className="gap-2">
                {t('home.viewAllTests')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </AnimatedSection>

          {loadingQuizzes ? (
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-[380px] flex-shrink-0">
                  <Card>
                    <CardContent className="p-4">
                      <div className="h-48 bg-muted rounded mb-4 animate-pulse" />
                      <div className="h-4 bg-muted rounded mb-2 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : popularQuizzes.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FileQuestion className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">{t('common.noData')}</p>
              </CardContent>
            </Card>
          ) : (
            <AutoScrollCarousel speed={25}>
              {popularQuizzes.map((quiz) => (
                <div key={quiz.id} className="w-[380px] flex-shrink-0">
                  <QuizCard {...quiz} />
                </div>
              ))}
            </AutoScrollCarousel>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Award className="w-3 h-3 mr-1" />
              Student Benefits
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Students Love Us
            </h2>
          </AnimatedSection>

          <StaggeredChildren
            animation="scaleIn"
            stagger={120}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, index) => (
              <Card key={index} className="premium-card text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </StaggeredChildren>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Trophy className="w-3 h-3 mr-1" />
              {t('testimonials.title')}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('testimonials.fromStudents')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t('testimonials.subtitle')}
            </p>
          </AnimatedSection>

          {loadingTestimonials ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : testimonials.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">{t('common.noData')}</p>
              </CardContent>
            </Card>
          ) : (
            <StaggeredChildren
              animation="fadeInUp"
              stagger={100}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
              {testimonials.slice(0, 6).map((testimonial) => (
                <Card key={testimonial.id} className="premium-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 text-yellow-500 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic line-clamp-4 leading-relaxed">
                      &quot;{testimonial.content}&quot;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </StaggeredChildren>
          )}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Feedback Form */}
            <AnimatedSection animation="fadeInLeft">
              <Badge variant="outline" className="mb-4">
                <Star className="w-3 h-3 mr-1" />
                {t('feedback.title')}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('feedback.title')}</h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                {t('feedback.subtitle')}
              </p>

              <Card className="shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="feedback-name">
                        {t('feedback.yourName')} <span className="text-muted-foreground">{t('feedback.optional')}</span>
                      </label>
                      <Input
                        id="feedback-name"
                        placeholder={t('feedback.yourName')}
                        value={feedbackName}
                        onChange={(e) => setFeedbackName(e.target.value)}
                        disabled={submittingFeedback}
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="feedback-rating">
                        {t('feedback.rating')}
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            className="text-yellow-500 hover:scale-110 transition-transform disabled:opacity-50"
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            disabled={submittingFeedback}
                          >
                            <Star
                              className={`w-8 h-8 ${feedbackRating >= star ? 'fill-current' : ''}`}
                            />
                          </button>
                        ))}
                        <span className="text-sm text-muted-foreground ml-2 font-medium">
                          {feedbackRating}/5
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="feedback-message">
                        {t('feedback.yourFeedback')} <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        id="feedback-message"
                        placeholder={t('feedback.placeholder')}
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        rows={6}
                        disabled={submittingFeedback}
                        maxLength={1000}
                        required
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {feedbackMessage.length}/1000 characters
                      </p>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={submittingFeedback}>
                      {submittingFeedback ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('feedback.submitting')}
                        </>
                      ) : (
                        <>
                          {t('feedback.submitFeedback')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Recent Feedback */}
            <AnimatedSection animation="fadeInRight">
              <h3 className="text-2xl font-bold mb-6">{t('feedback.whatOthersSay')}</h3>
              {loadingFeedbacks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : publicFeedbacks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {t('feedback.beFirst')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <VerticalAutoScroll speed={30} heightClass="h-[520px]">
                  {publicFeedbacks.map((item) => (
                    <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow border border-border/50 bg-background/95 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {[...Array(item.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed mb-3">
                          "{item.message}"
                        </p>
                        <p className="text-xs text-muted-foreground/80 font-medium">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </VerticalAutoScroll>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <AnimatedSection animation="slideUp" className="max-w-5xl mx-auto px-4 sm:px-6">
          <Card className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground border-0 shadow-2xl">
            <CardContent className="p-12 md:p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 animate-float">
                <GraduationCap className="w-10 h-10" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                {t('home.readyToStart')}
              </h2>
              <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t('home.readyToStartDesc')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={getStartedHref}>
                  <Button size="lg" variant="secondary" className="gap-2 text-base px-8 py-6 animate-pulseGlow">
                    {isAuthenticated ? t('home.goDashboard') : t('home.startLearning')}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-white/30 text-white hover:bg-white/10 text-base px-8 py-6"
                  >
                    <BookOpen className="w-5 h-5" />
                    {t('home.browseCourses')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </section>
    </div>
  );
}
