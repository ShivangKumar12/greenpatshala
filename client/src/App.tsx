// client/src/App.tsx - PRODUCTION READY WITH LANGUAGE SUPPORT
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";

import QuizResult from "@/pages/user/QuizResult";
import MyAttempts from "@/pages/user/MyAttempts";
import QuizPayment from "@/pages/payment/QuizPayment";
import QuizStatistics from "@/pages/admin/QuizStatistics";
import QuizResults from "@/pages/admin/QuizResults";
import CurrentAffairDetails from "@/pages/public/CurrentAffairDetails";
import ModulesManagement from "@/pages/admin/components/ModulesManagement";

// Layouts
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingTelegram from "@/components/ui/FloatingTelegram";

// Public Pages
import Home from "@/pages/public/Home";
import Courses from "@/pages/public/Courses";
import CourseDetails from "@/pages/public/CourseDetails";
import Quizzes from "@/pages/public/Quizzes";
import JobPortal from "@/pages/public/JobPortal";
import CurrentAffairs from "@/pages/public/CurrentAffairs";
import StudyMaterials from "@/pages/public/StudyMaterials";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";
import Tests from "@/pages/public/Tests";

// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import OAuthCallback from '@/pages/auth/OAuthCallback';

// User Pages
import UserDashboard from "@/pages/user/UserDashboard";
import QuizAttempt from "@/pages/user/QuizAttempt";
import CourseLearning from "@/pages/user/CourseLearning";
import MyCertificates from "@/pages/user/MyCertificates";

// Instructor Pages
import InstructorDashboard from "@/pages/instructor/InstructorDashboard";
import QuizCreate from "@/pages/instructor/QuizCreate";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Payment Pages
import CoursePayment from "@/pages/payment/CoursePayment";
import PaymentSuccess from "@/pages/payment/PaymentSuccess";
import PaymentFailure from "@/pages/payment/PaymentFailure";
import StudyMaterialPayment from '@/pages/payment/StudyMaterialPayment';

// Error & Utility Pages
import NotFound from "@/pages/not-found";
import Unauthorized from "@/pages/Unauthorized";
import ComingSoon from "@/pages/ComingSoon";
import Error500 from "@/pages/Error500";

// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================
function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (roles && user && !roles.includes(user.role)) {
    setLocation("/unauthorized");
    return null;
  }

  return <>{children}</>;
}

// ============================================
// LAYOUT COMPONENTS
// ============================================
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

// ============================================
// ROUTER COMPONENT
// ============================================
function Router() {
  const [location] = useLocation();

  // ✅ FIXED: Added "/auth" to catch /auth/callback
  const isAuthPage = [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
    "/auth", // ✅ THIS LINE ADDED
  ].some((path) => location.startsWith(path));

  const isPaymentPage = location.startsWith("/payment/");

  const isDashboardPage = [
    "/dashboard",
    "/admin",
    "/instructor",
    "/quiz/",
    "/learn/",
    "/my-",
    "/quiz-result/",
    "/my-certificates",
  ].some((path) => location.startsWith(path));

  // Auth Pages Layout
  if (isAuthPage) {
    return (
      <AuthLayout>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/verify-otp" component={VerifyOtp} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/auth/callback" component={OAuthCallback} />
          <Route component={NotFound} />
        </Switch>
      </AuthLayout>
    );
  }

  // Payment Pages Layout
  if (isPaymentPage) {
    return (
      <PaymentLayout>
        <Switch>
          {/* Course payment */}
          <Route path="/payment/course/:id" component={CoursePayment} />
          <Route path="/payment/material/:id" component={StudyMaterialPayment} />

          {/* Quiz payment */}
          <Route path="/payment/quiz/:id" component={QuizPayment} />

          <Route path="/payment/success" component={PaymentSuccess} />
          <Route path="/payment/failure" component={PaymentFailure} />
          <Route component={NotFound} />
        </Switch>
      </PaymentLayout>
    );
  }

  // Dashboard / Protected Pages Layout
  if (isDashboardPage) {
    return (
      <DashboardLayout>
        <Switch>
          {/* User Routes */}
          <Route path="/dashboard">
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          </Route>

          <Route path="/learn/:courseId">
            <ProtectedRoute>
              <CourseLearning />
            </ProtectedRoute>
          </Route>

          <Route path="/quiz/:id">
            <ProtectedRoute>
              <QuizAttempt />
            </ProtectedRoute>
          </Route>

          <Route path="/quiz-result/:id">
            <ProtectedRoute>
              <QuizResult />
            </ProtectedRoute>
          </Route>

          <Route path="/my-attempts">
            <ProtectedRoute>
              <MyAttempts />
            </ProtectedRoute>
          </Route>

          <Route path="/my-certificates">
            <ProtectedRoute>
              <MyCertificates />
            </ProtectedRoute>
          </Route>

          {/* Instructor Routes */}
          <Route path="/instructor">
            <ProtectedRoute roles={["instructor", "admin"]}>
              <InstructorDashboard />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/quizzes/:id/statistics">
            <ProtectedRoute roles={["admin", "instructor"]}>
              <QuizStatistics />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/quizzes/:id/results">
            <ProtectedRoute roles={["admin", "instructor"]}>
              <QuizResults />
            </ProtectedRoute>
          </Route>

          <Route path="/instructor/quizzes/new">
            <ProtectedRoute roles={["instructor", "admin"]}>
              <QuizCreate />
            </ProtectedRoute>
          </Route>

          {/* Admin Routes */}
          <Route path="/admin">
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          </Route>

          {/* Admin/Instructor Modules Management */}
          <Route path="/admin/courses/:courseId/modules">
            <ProtectedRoute roles={["admin", "instructor"]}>
              <ModulesManagement />
            </ProtectedRoute>
          </Route>

          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    );
  }

  // Public Pages Layout
  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/courses" component={Courses} />
        <Route path="/courses/:id" component={CourseDetails} />
        <Route path="/quizzes" component={Quizzes} />
        <Route path="/tests" component={Tests} />
        <Route path="/jobs" component={JobPortal} />
        <Route path="/current-affairs" component={CurrentAffairs} />
        <Route path="/current-affairs/:id" component={CurrentAffairDetails} />
        <Route path="/materials" component={StudyMaterials} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/live-classes" component={ComingSoon} />
        <Route path="/unauthorized" component={Unauthorized} />
        <Route path="/error" component={Error500} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              {/* ✅ ADD THIS LINE */}
              <FloatingTelegram
                telegramUrl="https://t.me/unchiudaan"
                username="@unchiudaan"
              />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

