// client/src/pages/instructor/InstructorDashboard.tsx - PRODUCTION READY
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  FileQuestion,
  Users,
  MessageSquare,
  Briefcase,
  Newspaper,
  FileText,
  Settings,
  TrendingUp,
  Plus,
  Layers,
  ListTree,
  FolderOpen
} from 'lucide-react';

// Import existing admin components (REUSE)
import CoursesManagement from '../admin/components/CoursesManagement';
import QuizzesManagement from '../admin/components/QuizzesManagement';
import FeedbackManagement from '../admin/components/FeedbackManagement';
import JobsManagement from '../admin/components/JobsManagement';
import CurrentAffairsManagement from '../admin/components/CurrentAffairsManagement';
import StudyMaterialsManagement from '../admin/components/StudyMaterialManagement';
import SubjectsManagement from '../admin/components/SubjectsManagement';
import ChaptersManagement from '../admin/components/ChaptersManagement';
import CategoriesManagement from '../admin/components/CategoriesManagement';

// Import instructor-specific components
import InstructorOverview from './components/InstructorOverview';
import InstructorSettings from './components/InstructorSettings';

const navigationTabs = [
  { value: 'overview', label: 'Overview', icon: TrendingUp },
  { value: 'courses', label: 'Courses', icon: BookOpen },
  { value: 'quizzes', label: 'Quizzes', icon: FileQuestion },
  { value: 'subjects', label: 'Subjects', icon: Layers },
  { value: 'chapters', label: 'Chapters', icon: ListTree },
  { value: 'categories', label: 'Categories', icon: FolderOpen },
  { value: 'feedback', label: 'Feedback', icon: MessageSquare },
  { value: 'jobs', label: 'Jobs', icon: Briefcase },
  { value: 'current-affairs', label: 'Current Affairs', icon: Newspaper },
  { value: 'study-material', label: 'Study Material', icon: FileText },
  { value: 'settings', label: 'Settings', icon: Settings },
];

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && navigationTabs.some(tab => tab.value === hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Badge className="mb-2" variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                Instructor Portal
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user?.name || 'Instructor'}!
              </h1>
              <p className="text-muted-foreground">
                Manage your courses, quizzes, and content from one place
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleTabChange('courses')}
              >
                <Plus className="w-4 h-4" />
                New Course
              </Button>
              <Button
                className="gap-2"
                onClick={() => handleTabChange('quizzes')}
              >
                <FileQuestion className="w-4 h-4" />
                Create Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <TabsList className="inline-flex h-auto w-full justify-start rounded-none bg-transparent p-0 overflow-x-auto">
              {navigationTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 gap-2 whitespace-nowrap"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="overview" className="mt-0">
            <InstructorOverview onNavigate={handleTabChange} />
          </TabsContent>

          <TabsContent value="courses" className="mt-0">
            <CoursesManagement />
          </TabsContent>

          <TabsContent value="quizzes" className="mt-0">
            <QuizzesManagement />
          </TabsContent>

          <TabsContent value="subjects" className="mt-0">
            <SubjectsManagement />
          </TabsContent>

          <TabsContent value="chapters" className="mt-0">
            <ChaptersManagement />
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            <CategoriesManagement />
          </TabsContent>

          <TabsContent value="feedback" className="mt-0">
            <FeedbackManagement />
          </TabsContent>

          <TabsContent value="jobs" className="mt-0">
            <JobsManagement />
          </TabsContent>

          <TabsContent value="current-affairs" className="mt-0">
            <CurrentAffairsManagement />
          </TabsContent>

          <TabsContent value="study-material" className="mt-0">
            <StudyMaterialsManagement />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <InstructorSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
