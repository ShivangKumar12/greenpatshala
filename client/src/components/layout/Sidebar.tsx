// client/src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  GraduationCap,
  Trophy,
  Calendar,
  Settings,
  Users,
  Briefcase,
  Newspaper,
  FileText,
  BarChart3,
  DollarSign,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  roles?: string[];
}

const userNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Courses', href: '/my-courses', icon: BookOpen },
  { label: 'My Quizzes', href: '/my-quizzes', icon: FileQuestion },
  { label: 'Study Materials', href: '/materials', icon: FileText },
  { label: 'Certificates', href: '/certificates', icon: Trophy },
  { label: 'Schedule', href: '/schedule', icon: Calendar },
];

const instructorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
  { label: 'Courses', href: '/instructor/courses', icon: BookOpen },
  { label: 'Quizzes', href: '/instructor/quizzes', icon: FileQuestion },
  { label: 'Students', href: '/instructor/students', icon: Users },
  { label: 'Materials', href: '/instructor/materials', icon: FileText },
  { label: 'Current Affairs', href: '/instructor/current-affairs', icon: Newspaper },
  { label: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
  { label: 'Earnings', href: '/instructor/earnings', icon: DollarSign },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Courses', href: '/admin/courses', icon: BookOpen },
  { label: 'Quizzes', href: '/admin/quizzes', icon: FileQuestion },
  { label: 'Job Portal', href: '/admin/jobs', icon: Briefcase },
  { label: 'Current Affairs', href: '/admin/current-affairs', icon: Newspaper },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = user?.role === 'admin'
    ? adminNavItems
    : user?.role === 'instructor'
      ? instructorNavItems
      : userNavItems;

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'instructor':
        return <Badge className="bg-purple-600">Instructor</Badge>;
      default:
        return <Badge variant="secondary">Student</Badge>;
    }
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'
        }`}
    >
      <div className="flex flex-col h-full">
        {/* User Profile */}
        {!collapsed && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            {getRoleBadge()}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`group w-full h-11 justify-start gap-3 relative overflow-hidden transition-all duration-300 hover:translate-x-1 ${isActive
                        ? 'bg-primary/10 text-primary font-medium hover:bg-primary/15'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      } ${collapsed ? 'px-2 justify-center' : 'px-4'}`}
                    title={collapsed ? item.label : undefined}
                    data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-md shadow-[0_0_8px_rgba(0,0,0,0.1)] shadow-primary/40" />
                    )}
                    <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary/70'}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left tracking-wide">{item.label}</span>
                        {item.badge && (
                          <Badge variant="outline" className="ml-auto bg-background/50 border-border/60">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        <Separator />

        <div className="p-4 space-y-2 border-t bg-muted/10">
          <Link href="/settings">
            <Button
              variant="ghost"
              className={`group w-full h-11 justify-start gap-3 transition-all duration-300 hover:translate-x-1 text-muted-foreground hover:text-foreground hover:bg-muted/40 ${collapsed ? 'px-2 justify-center' : 'px-4'}`}
              title={collapsed ? 'Settings' : undefined}
              data-testid="sidebar-link-settings"
            >
              <Settings className="w-5 h-5 shrink-0 transition-colors group-hover:text-primary/70" />
              {!collapsed && <span className="flex-1 text-left tracking-wide">Settings</span>}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center h-10 transition-all duration-300 hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={() => setCollapsed(!collapsed)}
            data-testid="button-toggle-sidebar"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
