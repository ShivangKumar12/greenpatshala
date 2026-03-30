// client/src/pages/admin/AdminDashboard.tsx - WITH REAL DATA
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import StatCard from '@/components/cards/StatCard';
import {
  Users,
  BookOpen,
  IndianRupee,
  Briefcase,
  Shield,
  FileQuestion,
  Newspaper,
  BookMarked,
  Settings,
  CreditCard,
  MessageSquare,
  Award,
  Ticket,
  DollarSign,
  Loader2,
} from 'lucide-react';

// Import sub-components
import CoursesManagement from './components/CoursesManagement';
import QuizzesManagement from './components/QuizzesManagement';
import JobsManagement from './components/JobsManagement';
import CurrentAffairsManagement from './components/CurrentAffairsManagement';
import StudyMaterialManagement from './components/StudyMaterialManagement';
import UsersManagement from './components/UsersManagement';
import SiteSettings from './components/SiteSettings';
import PaymentsManagement from './components/PaymentsManagement';
import FeedbackManagement from './components/FeedbackManagement';
import CouponsManagement from './components/CouponsManagement';
import CertificateTemplates from './components/CertificateTemplates';
import SubjectsManagement from './components/SubjectsManagement';
import ChaptersManagement from './components/ChaptersManagement';
import CategoriesManagement from './components/CategoriesManagement';

// Import API services
import { getAdminStats, getRecentPayments, getChartData, type DashboardStats, type RecentPayment } from '@/services/adminApi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate, toast]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsResponse, paymentsResponse, chartsResponse] = await Promise.all([
        getAdminStats(),
        getRecentPayments(5),
        getChartData(),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      if (chartsResponse.success) {
        if (chartsResponse.revenueHistory) setRevenueData(chartsResponse.revenueHistory);
        if (chartsResponse.userGrowth) setUserGrowthData(chartsResponse.userGrowth);
      }

      if (paymentsResponse.success) {
        setRecentPayments(paymentsResponse.payments || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const adminStats = stats
    ? [
      {
        title: 'Total Users',
        value: stats.totalUsers.toLocaleString(),
        icon: Users,
        variant: 'primary' as const,
      },
      {
        title: 'Total Revenue',
        value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`,
        icon: IndianRupee,
        variant: 'default' as const,
      },
      {
        title: 'Total Courses',
        value: stats.totalCourses.toString(),
        icon: BookOpen,
        variant: 'success' as const,
      },
      {
        title: 'Total Payments',
        value: stats.totalPayments.toLocaleString(),
        icon: CreditCard,
        variant: 'warning' as const,
      },
    ]
    : [];

  const quickActions = [
    {
      title: 'Manage Courses',
      description: 'Create, edit, and manage courses',
      icon: BookOpen,
      tab: 'courses',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Manage Quizzes',
      description: 'Create and schedule quizzes',
      icon: FileQuestion,
      tab: 'quizzes',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Payments',
      description: 'View and manage payments',
      icon: CreditCard,
      tab: 'payments',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      title: 'Coupons',
      description: 'Manage discount coupons',
      icon: Ticket,
      tab: 'coupons',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
    },
    {
      title: 'Feedback & Stories',
      description: 'Reviews and success stories',
      icon: MessageSquare,
      tab: 'feedback',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
    },
    {
      title: 'Job Posts',
      description: 'Post government job updates',
      icon: Briefcase,
      tab: 'jobs',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Current Affairs',
      description: 'Daily current affairs updates',
      icon: Newspaper,
      tab: 'current-affairs',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Study Material',
      description: 'Upload PDFs and resources',
      icon: BookMarked,
      tab: 'study-material',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: Users,
      tab: 'users',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
    },
    {
      title: 'Site Settings',
      description: 'Website branding and config',
      icon: Settings,
      tab: 'settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
    },
    {
      title: 'Certificates',
      description: 'Certificate templates & records',
      icon: Award,
      tab: 'certificates',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 border-b-2 border-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950 dark:via-orange-950 dark:to-amber-950 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <Badge className="mb-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <Shield className="w-3 h-3 mr-1" />
                Admin Dashboard
              </Badge>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Admin'}</h1>
              <p className="text-muted-foreground">
                Manage your platform, users, content, and settings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {adminStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center w-full mb-8">
            <div className="overflow-x-auto scrollbar-hide pb-2 max-w-full">
              <TabsList className="bg-muted/70 hover:bg-muted/90 transition-colors duration-300 p-1.5 inline-flex flex-nowrap h-auto rounded-full border shadow-inner min-w-max">
                <TabsTrigger value="overview" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Overview</TabsTrigger>
                <TabsTrigger value="courses" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Courses</TabsTrigger>
                <TabsTrigger value="quizzes" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Quizzes</TabsTrigger>
                <TabsTrigger value="payments" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Payments</TabsTrigger>
                <TabsTrigger value="coupons" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Coupons</TabsTrigger>
                <TabsTrigger value="feedback" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Feedback</TabsTrigger>
                <TabsTrigger value="jobs" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Jobs</TabsTrigger>
                <TabsTrigger value="current-affairs" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Current Affairs</TabsTrigger>
                <TabsTrigger value="study-material" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Study Material</TabsTrigger>
                <TabsTrigger value="users" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Users</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Settings</TabsTrigger>
                <TabsTrigger value="certificates" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Certificates</TabsTrigger>
                <TabsTrigger value="subjects" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Subjects</TabsTrigger>
                <TabsTrigger value="chapters" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Chapters</TabsTrigger>
                <TabsTrigger value="categories-mgmt" className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:scale-105">Categories</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">

            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Revenue Trend Area Chart */}
                <Card className="lg:col-span-2 shadow-sm border-border/50 overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-emerald-600" />
                      Revenue Growth Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-6">
                    <div className="h-[300px] w-full px-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={revenueData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                          />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <RechartsTooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1500} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Distribution Pie Chart */}
                <Card className="shadow-sm border-border/50">
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Platform Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center h-[300px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Courses', value: stats.totalCourses || 1 },
                            { name: 'Coupons', value: stats.totalCoupons || 1 },
                            { name: 'Stories', value: stats.successStories || 1 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={1500}
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#ec4899" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Additional Stats Row */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Pending Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{stats.pendingPayments}</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      Total Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{stats.totalFeedback}</div>
                    <p className="text-xs text-muted-foreground mt-1">Reviews received</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      Success Stories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{stats.successStories}</div>
                    <p className="text-xs text-muted-foreground mt-1">Published stories</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-pink-600" />
                      Active Coupons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{stats.activeCoupons}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      of {stats.totalCoupons} total
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* User Growth Bar Chart & Recent Payments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* User Growth Bar Chart */}
              {stats && (
                <Card className="shadow-sm border-border/50 overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Weekly User Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-6">
                    <div className="h-[300px] w-full px-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={userGrowthData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="users" fill="#4f46e5" radius={[4, 4, 0, 0]} animationDuration={1500}>
                            {
                              [...Array(7)].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 6 ? '#4f46e5' : '#818cf8'} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Payments */}
              <Card className="shadow-sm border-border/50 flex flex-col">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      Recent Payments
                    </span>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">{recentPayments.length} Recent</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-4 pt-6">
                  {recentPayments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                      <DollarSign className="w-12 h-12 mb-2 opacity-20" />
                      <p>No recent payments</p>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1">
                      {recentPayments.map((payment, i) => (
                        <motion.div
                          key={payment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                {payment.user.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{payment.user}</p>
                              <p className="text-xs text-muted-foreground max-w-[150px] truncate">{payment.item}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                              ₹{payment.amount.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{payment.date}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-auto"
                    onClick={() => setActiveTab('payments')}
                  >
                    View All Payments
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions Grid (Moved to bottom) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-muted-foreground" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Card
                    key={index}
                    className="hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all duration-300 border-border/50"
                    onClick={() => setActiveTab(action.tab)}
                  >
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${action.bgColor}`}>
                        <action.icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold leading-none mb-1.5">{action.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{action.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Management Tabs */}
          <TabsContent value="courses">
            <CoursesManagement />
          </TabsContent>

          <TabsContent value="quizzes">
            <QuizzesManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsManagement />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponsManagement />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackManagement />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsManagement />
          </TabsContent>

          <TabsContent value="current-affairs">
            <CurrentAffairsManagement />
          </TabsContent>

          <TabsContent value="study-material">
            <StudyMaterialManagement />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettings />
          </TabsContent>

          <TabsContent value="certificates">
            <CertificateTemplates />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectsManagement />
          </TabsContent>

          <TabsContent value="chapters">
            <ChaptersManagement />
          </TabsContent>

          <TabsContent value="categories-mgmt">
            <CategoriesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
