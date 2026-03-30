import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  FileQuestion,
  Settings,
  Play,
  CheckCircle,
  Clock,
  Award,
  User,
  Mail,
  Lock,
  Bell,
  LogOut,
  HelpCircle,
  Shield,
  Loader2,
  Download,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/axios';
import { useUserCertificates, downloadCertificatePDF } from '@/services/certificateApi';

type EnrolledCourse = {
  enrollmentId: number;
  progress: number;
  completedLessons: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
  course: {
    id: number;
    title: string;
    thumbnail: string | null;
    duration: string;
    totalLessons: number;
    category: string;
  };
};

type EnrolledQuiz = {
  id: number;
  quiz_id: number;
  title: string;
  thumbnail: string | null;
  category: string;
  difficulty: string;
  total_attempts: number;
  best_score: number | null;
  is_passed: boolean;
  last_attempt_date: string | null;
};

type NotificationSettings = {
  emailNotifications: boolean;
  courseUpdates: boolean;
  quizReminders: boolean;
};

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('courses');

  // State
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [enrolledQuizzes, setEnrolledQuizzes] = useState<EnrolledQuiz[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Certifications
  const { data: certificatesData, isLoading: loadingCertificates } = useUserCertificates();
  const certificates = certificatesData || [];

  // Settings Dialogs State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [enable2FAOpen, setEnable2FAOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Settings Form State
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    courseUpdates: true,
    quizReminders: true,
  });
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // Loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);

  // Initialize user data
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  // Fetch enrolled courses
  useEffect(() => {
    async function fetchEnrolledCourses() {
      try {
        setLoadingCourses(true);
        const response = await apiClient.get('/courses/my/list');

        if (response.data.success) {
          setEnrolledCourses(response.data.courses || []);
        }
      } catch (error: any) {
        console.error('Fetch courses error:', error);
        if (error.response?.status !== 400) {
          toast({
            title: 'Failed to load courses',
            description: error.response?.data?.message || 'Please try again later.',
            variant: 'destructive',
          });
        }
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchEnrolledCourses();
  }, [toast]);

  // Fetch enrolled quizzes
  useEffect(() => {
    async function fetchEnrolledQuizzes() {
      try {
        setLoadingQuizzes(true);
        const response = await apiClient.get('/quizzes/my-quizzes');

        if (response.data.success) {
          setEnrolledQuizzes(response.data.quizzes || []);
        }
      } catch (error: any) {
        console.error('Fetch quizzes error:', error);
        if (error.response?.status !== 400) {
          toast({
            title: 'Failed to load quizzes',
            description: error.response?.data?.message || 'Please try again later.',
            variant: 'destructive',
          });
        }
      } finally {
        setLoadingQuizzes(false);
      }
    }
    fetchEnrolledQuizzes();
  }, [toast]);

  // Stats calculation
  const completedCourses = enrolledCourses.filter(c => c.completedAt).length;

  // ============================================
  // SETTINGS HANDLERS
  // ============================================

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSavingProfile(true);
      const response = await apiClient.put('/auth/profile', {
        name: profileForm.name,
        email: profileForm.email,
      });

      if (response.data.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully',
        });
        setEditProfileOpen(false);
        // Refresh user data
        window.location.reload();
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'All password fields are required',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'New password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      setChangingPassword(true);
      const response = await apiClient.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.data.success) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been changed successfully',
        });
        setChangePasswordOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      toast({
        title: 'Password Change Failed',
        description: error.response?.data?.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setEnabling2FA(true);
      const response = await apiClient.post('/auth/enable-2fa');

      if (response.data.success) {
        setTwoFAEnabled(true);
        toast({
          title: '2FA Enabled',
          description: 'Two-Factor Authentication has been enabled for your account',
        });
        setEnable2FAOpen(false);
      }
    } catch (error: any) {
      toast({
        title: '2FA Setup Failed',
        description: error.response?.data?.message || 'Failed to enable 2FA',
        variant: 'destructive',
      });
    } finally {
      setEnabling2FA(false);
    }
  };

  const handleNotificationToggle = async (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));

    try {
      await apiClient.put('/auth/notification-preferences', {
        [key]: value,
      });

      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved',
      });
    } catch (error: any) {
      // Revert on error
      setNotifications(prev => ({ ...prev, [key]: !value }));
      toast({
        title: 'Update Failed',
        description: 'Failed to update notification preferences',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully',
      });
      setLocation('/login');
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: 'An error occurred while logging out',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card rounded-xl p-5 border shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold">{enrolledCourses.length}</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card rounded-xl p-5 border shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold">{completedCourses}</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card rounded-xl p-5 border shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Attempted Quizzes</p>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FileQuestion className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-bold">{enrolledQuizzes.length}</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => setActiveTab('certificates')}
              className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-5 border border-amber-200 dark:border-amber-800 shadow-sm cursor-pointer hover:shadow-md hover:border-amber-400 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Certificates</p>
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg group-hover:scale-110 transition-transform">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                  {loadingCertificates ? <Loader2 className="w-6 h-6 animate-spin" /> : certificates.length}
                </p>
                <span className="text-sm font-semibold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="courses" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <BookOpen className="w-4 h-4" />
              My Courses
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <FileQuestion className="w-4 h-4" />
              My Quizzes
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <Award className="w-4 h-4" />
              My Certifications
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            {loadingCourses ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your courses...</p>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No enrolled courses yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Explore our courses and start your learning journey today!
                  </p>
                  <Link href="/courses">
                    <Button>Browse Courses</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {enrolledCourses.map((item, index) => {
                  const course = item.course;
                  const isCompleted = item.completedAt !== null;

                  return (
                    <motion.div
                      key={item.enrollmentId}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 h-full border-muted/60 overflow-hidden group">
                        <CardHeader className="p-0">
                          <div className="relative">
                            <img
                              src={course.thumbnail || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400'}
                              alt={course.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400';
                              }}
                            />
                            {isCompleted && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Completed
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                          <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {course.duration}
                            </span>
                            <span>{item.completedLessons}/{course.totalLessons} lessons</span>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Progress</span>
                              <span className="text-sm font-semibold">{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} />
                          </div>

                          <Link href={`/courses/${course.id}`}>
                            <Button className="w-full gap-2">
                              <Play className="w-4 h-4" />
                              {isCompleted ? 'Review Course' : 'Continue Learning'}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            {loadingQuizzes ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your quizzes...</p>
              </div>
            ) : enrolledQuizzes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No quizzes attempted yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Test your knowledge with our comprehensive quizzes!
                  </p>
                  <Link href="/quizzes">
                    <Button>Browse Quizzes</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {enrolledQuizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 h-full border-muted/60 group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant={quiz.is_passed ? 'default' : 'secondary'}>
                            {quiz.difficulty}
                          </Badge>
                          {quiz.is_passed && (
                            <Award className="w-5 h-5 text-green-500" />
                          )}
                        </div>

                        <h3 className="font-semibold mb-2 line-clamp-2">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{quiz.category}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Attempts</span>
                            <span className="font-semibold">{quiz.total_attempts}</span>
                          </div>
                          {quiz.best_score !== null && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Best Score</span>
                              <span className={`font-semibold ${quiz.best_score >= 80 ? 'text-green-600' :
                                quiz.best_score >= 60 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                {quiz.best_score}%
                              </span>
                            </div>
                          )}
                        </div>

                        <Link href={`/quizzes/${quiz.quiz_id}`}>
                          <Button className="w-full" variant={quiz.is_passed ? 'outline' : 'default'}>
                            {quiz.total_attempts === 0 ? 'Start Quiz' : 'Retake Quiz'}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            {loadingCertificates ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your certificates...</p>
              </div>
            ) : certificates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Complete courses or pass quizzes to earn your first certificate!
                  </p>
                  <Link href="/courses">
                    <Button>Keep Learning</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {certificates.map((cert: any, index: number) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 h-full border-amber-100 dark:border-amber-900/40 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200 to-amber-500 opacity-20 dark:opacity-10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
                      <CardContent className="p-6 flex flex-col h-full z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
                            <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                          </div>
                          <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                            ID: {cert.certificateNumber || 'N/A'}
                          </Badge>
                        </div>

                        <h3 className="font-bold text-lg mb-1 leading-tight line-clamp-2">
                          {cert.course?.title || cert.quiz?.title || 'Unknown Title'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          {cert.type === 'course' ? 'Course Completion' : 'Quiz Achievement'}
                        </p>

                        <div className="flex items-center gap-2 text-sm font-medium mb-6">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3">
                          <Link href={`/certificates/${cert.id}`}>
                            <Button variant="outline" className="w-full text-xs h-9 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                              <ExternalLink className="w-3 h-3 mr-1" /> View
                            </Button>
                          </Link>
                          <Button
                            className="w-full text-xs h-9 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                            onClick={() => downloadCertificatePDF(cert.id)}
                          >
                            <Download className="w-3 h-3 mr-1" /> PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <div className="text-sm text-muted-foreground">{user?.name || 'Not set'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <div className="text-sm text-muted-foreground">{user?.email || 'Not set'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role</label>
                    <Badge variant="outline">{user?.role || 'Student'}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setEditProfileOpen(true)}
                  >
                    <User className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Password</label>
                    <div className="text-sm text-muted-foreground">••••••••</div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </Button>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {twoFAEnabled ? 'Enabled' : 'Add extra security'}
                        </p>
                      </div>
                      {twoFAEnabled && (
                        <Shield className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <Button
                      variant={twoFAEnabled ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => setEnable2FAOpen(true)}
                      disabled={twoFAEnabled}
                    >
                      {twoFAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationToggle('emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Course Updates</p>
                      <p className="text-xs text-muted-foreground">New lessons and announcements</p>
                    </div>
                    <Switch
                      checked={notifications.courseUpdates}
                      onCheckedChange={(checked) => handleNotificationToggle('courseUpdates', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Quiz Reminders</p>
                      <p className="text-xs text-muted-foreground">Upcoming quiz deadlines</p>
                    </div>
                    <Switch
                      checked={notifications.quizReminders}
                      onCheckedChange={(checked) => handleNotificationToggle('quizReminders', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Account Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/support">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/help">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Help & FAQs
                    </Button>
                  </Link>
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => setLogoutConfirmOpen(true)}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ============================================ */}
      {/* DIALOG MODALS FOR SETTINGS */}
      {/* ============================================ */}

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable 2FA Dialog */}
      <Dialog open={enable2FAOpen} onOpenChange={setEnable2FAOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Add an extra layer of security to your account
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Download an authenticator app (Google Authenticator, Authy)</li>
                    <li>Scan the QR code or enter the setup key</li>
                    <li>Enter the 6-digit code to verify</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="text-center py-4">
              <div className="w-48 h-48 bg-muted rounded-lg mx-auto flex items-center justify-center">
                <p className="text-sm text-muted-foreground">QR Code will appear here</p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Or enter this code manually: <code className="bg-muted px-2 py-1 rounded">XXXX-XXXX-XXXX-XXXX</code>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnable2FAOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnable2FA} disabled={enabling2FA}>
              {enabling2FA && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
