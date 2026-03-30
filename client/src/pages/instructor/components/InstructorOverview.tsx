// client/src/pages/instructor/components/InstructorOverview.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  FileQuestion,
  Layers,
  ListTree,
  FolderOpen,
  Newspaper,
  Briefcase,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { getAdminCourses } from '@/services/adminCoursesApi';
import { getAdminQuizzes } from '@/services/adminQuizApi';
import { getAdminSubjects } from '@/services/adminSubjectApi';
import { getAdminAllCategories } from '@/services/adminCategoryApi';

interface InstructorOverviewProps {
  onNavigate: (tab: string) => void;
}

interface ContentStats {
  courses: { total: number; published: number };
  quizzes: { total: number; published: number };
  subjects: number;
  categories: number;
}

const tips = [
  { icon: '🎯', text: 'Add quiz thumbnails to increase click-through rates by up to 40%.' },
  { icon: '📝', text: 'Keep quiz duration between 15–30 minutes for the best completion rate.' },
  { icon: '📊', text: 'Subjects with 3+ chapters perform better in student engagement.' },
  { icon: '🔖', text: 'Use categories and subcategories to help students find content quickly.' },
  { icon: '⚡', text: 'Schedule quizzes during peak hours (7–10 PM) for maximum participation.' },
];

const InstructorOverview: React.FC<InstructorOverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesRes, quizzesRes, subjectsRes, categoriesRes] = await Promise.allSettled([
        getAdminCourses({ page: 1, limit: 1 }),
        getAdminQuizzes({ page: 1, limit: 1 }),
        getAdminSubjects(),
        getAdminAllCategories(),
      ]);

      const courses = coursesRes.status === 'fulfilled' ? coursesRes.value : null;
      const quizzes = quizzesRes.status === 'fulfilled' ? quizzesRes.value : null;
      const subjects = subjectsRes.status === 'fulfilled' ? subjectsRes.value : null;
      const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : null;

      setStats({
        courses: {
          total: courses?.pagination?.total || 0,
          published: (courses?.courses || []).filter((c: any) => c.isPublished).length,
        },
        quizzes: {
          total: (quizzes as any)?.totalQuizzes || (quizzes as any)?.pagination?.total || 0,
          published: (quizzes as any)?.quizzes?.filter?.((q: any) => q.is_published)?.length || 0,
        },
        subjects: (subjects as any)?.subjects?.length || 0,
        categories: (categories as any)?.categories?.length || 0,
      });
    } catch {
      // Silently fail — dashboard still usable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      label: 'Total Courses',
      value: stats?.courses.total || 0,
      sub: `${stats?.courses.published || 0} published`,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800',
      tab: 'courses',
    },
    {
      label: 'Total Quizzes',
      value: stats?.quizzes.total || 0,
      sub: `${stats?.quizzes.published || 0} published`,
      icon: FileQuestion,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-800',
      tab: 'quizzes',
    },
    {
      label: 'Subjects',
      value: stats?.subjects || 0,
      sub: 'Test subjects',
      icon: Layers,
      color: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-200 dark:border-teal-800',
      tab: 'subjects',
    },
    {
      label: 'Categories',
      value: stats?.categories || 0,
      sub: 'Content categories',
      icon: FolderOpen,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      border: 'border-orange-200 dark:border-orange-800',
      tab: 'categories',
    },
  ];

  const quickActions = [
    { label: 'New Course', icon: BookOpen, tab: 'courses', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'New Quiz', icon: FileQuestion, tab: 'quizzes', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Add Subject', icon: Layers, tab: 'subjects', color: 'bg-teal-600 hover:bg-teal-700' },
    { label: 'Add Chapter', icon: ListTree, tab: 'chapters', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { label: 'Post Job', icon: Briefcase, tab: 'jobs', color: 'bg-rose-600 hover:bg-rose-700' },
    { label: 'Current Affairs', icon: Newspaper, tab: 'current-affairs', color: 'bg-amber-600 hover:bg-amber-700' },
    { label: 'Study Material', icon: FileText, tab: 'study-material', color: 'bg-emerald-600 hover:bg-emerald-700' },
  ];

  const contentSections = [
    { label: 'Courses', desc: 'Create and manage video courses, lessons and modules', icon: BookOpen, tab: 'courses', color: 'text-blue-600' },
    { label: 'Quizzes', desc: 'Build quizzes with MCQ questions and scheduling', icon: FileQuestion, tab: 'quizzes', color: 'text-purple-600' },
    { label: 'Subjects & Chapters', desc: 'Organise test hierarchy with subjects and chapters', icon: Layers, tab: 'subjects', color: 'text-teal-600' },
    { label: 'Categories', desc: 'Manage categories and subcategories for content', icon: FolderOpen, tab: 'categories', color: 'text-orange-600' },
    { label: 'Study Material', desc: 'Upload PDFs, notes and reference material', icon: FileText, tab: 'study-material', color: 'text-emerald-600' },
    { label: 'Current Affairs', desc: 'Post daily current affairs and news items', icon: Newspaper, tab: 'current-affairs', color: 'text-amber-600' },
    { label: 'Jobs', desc: 'Post government and private job opportunities', icon: Briefcase, tab: 'jobs', color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      {/* ═══ Stats Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-4 w-20 bg-muted rounded mb-3" />
                <div className="h-8 w-12 bg-muted rounded mb-2" />
                <div className="h-3 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
          : statCards.map((s) => (
            <Card
              key={s.label}
              className={`cursor-pointer ${s.border} border hover:shadow-lg transition-all duration-300 group`}
              onClick={() => onNavigate(s.tab)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{s.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* ═══ Quick Actions + Tip ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:scale-[1.02] transition-transform"
                  onClick={() => onNavigate(action.tab)}
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pro Tip */}
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Pro Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[80px] flex items-center">
              <p className="text-sm text-muted-foreground leading-relaxed transition-all duration-500">
                <span className="text-2xl mr-2">{tips[tipIndex].icon}</span>
                {tips[tipIndex].text}
              </p>
            </div>
            <div className="flex gap-1 mt-3">
              {tips.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full flex-1 transition-colors duration-300 ${i === tipIndex ? 'bg-amber-500' : 'bg-amber-200 dark:bg-amber-800'
                    }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ All Content Sections ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Manage Content
            </CardTitle>
            {!loading && (
              <Button variant="ghost" size="icon" onClick={fetchStats} title="Refresh stats">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {contentSections.map((section) => (
              <div
                key={section.label}
                className="group flex items-start gap-3 p-4 rounded-xl border hover:border-primary/30 hover:bg-muted/50 cursor-pointer transition-all duration-200"
                onClick={() => onNavigate(section.tab)}
              >
                <div className="p-2 rounded-lg bg-muted group-hover:bg-background transition-colors">
                  <section.icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-0.5 flex items-center gap-2">
                    {section.label}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">{section.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══ Getting Started Checklist ═══ */}
      {stats && (stats.courses.total === 0 || stats.quizzes.total === 0) && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { done: (stats.categories || 0) > 0, text: 'Create categories to organise your content', tab: 'categories' },
                { done: (stats.subjects || 0) > 0, text: 'Set up subjects for the test system', tab: 'subjects' },
                { done: (stats.courses.total || 0) > 0, text: 'Create your first course', tab: 'courses' },
                { done: (stats.quizzes.total || 0) > 0, text: 'Build your first quiz', tab: 'quizzes' },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => !step.done && onNavigate(step.tab)}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${step.done
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-muted-foreground/30 group-hover:border-primary'
                    }`}>
                    {step.done && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm ${step.done ? 'line-through text-muted-foreground' : 'group-hover:text-primary'}`}>
                    {step.text}
                  </span>
                  {!step.done && (
                    <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstructorOverview;
