// client/src/components/layout/Navbar.tsx - PRODUCTION READY
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import NotificationBell from '@/components/notifications/NotificationBell';
import {
  Menu,
  X,
  Sun,
  Moon,
  BookOpen,
  FileText,
  Briefcase,
  Newspaper,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Languages
} from 'lucide-react';

const publicNavItems = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.courses', href: '/courses', icon: BookOpen },
  { labelKey: 'nav.quizzes', href: '/quizzes', icon: FileText },
  { labelKey: 'Tests', href: '/tests', icon: FileText },
  { labelKey: 'nav.materials', href: '/materials', icon: FileText },
  { labelKey: 'nav.jobs', href: '/jobs', icon: Briefcase },
];

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'instructor': return '/instructor';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 md:gap-8">

          {/* Left Side: Logo */}
          <div className="flex flex-1 items-center justify-start">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0"
              data-testid="link-home-logo"
            >
              <img
                src="/logo.png"
                alt="Green Patshala Logo"
                className="h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
                loading="eager"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex flex-none items-center justify-center gap-1.5">
            {publicNavItems.slice(0, 5).map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`rounded-full transition-all duration-300 px-4 font-medium ${location === item.href
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                  data-testid={`link-nav-${item.labelKey}`}
                >
                  {t(item.labelKey)}
                </Button>
              </Link>
            ))}

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full transition-all duration-300 px-4 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 group"
                  data-testid="dropdown-more"
                >
                  {t('nav.more')} <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-lg border-border/50">
                <Link href="/jobs">
                  <DropdownMenuItem data-testid="link-jobs">
                    <Briefcase className="mr-2 h-4 w-4" />
                    {t('nav.jobs')}
                  </DropdownMenuItem>
                </Link>
                <Link href="/current-affairs">
                  <DropdownMenuItem data-testid="link-current-affairs">
                    <Newspaper className="mr-2 h-4 w-4" />
                    {t('nav.currentAffairs')}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href="/about">
                  <DropdownMenuItem data-testid="link-about">
                    {t('nav.about')}
                  </DropdownMenuItem>
                </Link>
                <Link href="/contact">
                  <DropdownMenuItem data-testid="link-contact">
                    {t('nav.contact')}
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side Actions */}
          <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full hover:bg-muted/80 transition-colors duration-300 h-9 w-9 p-0"
                  data-testid="button-language-toggle"
                  aria-label="Change language"
                >
                  <Languages className="h-5 w-5" />
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full p-0 flex items-center justify-center text-[9px] font-bold border-2 border-background shadow-sm"
                  >
                    {language.toUpperCase()}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-secondary' : ''}
                  data-testid="language-english"
                >
                  <span className="mr-2">🇬🇧</span>
                  English
                  {language === 'en' && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage('hi')}
                  className={language === 'hi' ? 'bg-secondary' : ''}
                  data-testid="language-hindi"
                >
                  <span className="mr-2">🇮🇳</span>
                  हिंदी
                  {language === 'hi' && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted/80 transition-colors duration-300 h-9 w-9"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 transform hover:rotate-45 transition-transform duration-300" />}
            </Button>

            {/* Notification Bell */}
            {isAuthenticated && <NotificationBell />}

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 p-0 rounded-full ml-1 ring-2 ring-primary/20 hover:ring-primary/50 transition-all duration-300"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-sm font-medium leading-none">{user?.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href={getDashboardLink()}>
                    <DropdownMenuItem data-testid="link-dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('auth.dashboard')}
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem data-testid="link-settings">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('auth.settings')}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-3 ml-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-full hover:bg-muted/80 transition-colors px-4 font-medium" data-testid="button-login">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 px-5 font-medium" data-testid="button-signup">
                    {t('auth.signup')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <div className="flex flex-col gap-4 mt-6">

                  {/* Mobile Logo */}
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <img
                      src="/favicon.png"
                      alt="Unchi Udaan"
                      className="h-8 w-auto"
                    />
                  </div>

                  {/* Mobile User Info */}
                  {isAuthenticated && (
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                      </div>
                    </div>
                  )}

                  {/* Mobile Quick Actions */}
                  <div className="flex gap-2 pb-4 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                      className="flex-1"
                    >
                      <Languages className="mr-2 h-4 w-4" />
                      {language === 'en' ? 'EN' : 'HI'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleTheme}
                      className="flex-1"
                    >
                      {theme === 'light' ? (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          Dark
                        </>
                      ) : (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          Light
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex flex-col gap-1">
                    {publicNavItems.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                        <Button
                          variant={location === item.href ? 'secondary' : 'ghost'}
                          className="w-full justify-start"
                        >
                          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                          {t(item.labelKey)}
                        </Button>
                      </Link>
                    ))}

                    <Link href="/current-affairs" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Newspaper className="mr-2 h-4 w-4" />
                        {t('nav.currentAffairs')}
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile Footer */}
                  <div className="border-t pt-4 mt-2 flex flex-col gap-1">
                    {isAuthenticated ? (
                      <>
                        <Link href={getDashboardLink()} onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            {t('auth.dashboard')}
                          </Button>
                        </Link>
                        <Link href="/settings" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            {t('auth.settings')}
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            logout();
                            setMobileOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {t('auth.logout')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full">
                            {t('auth.login')}
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full">
                            {t('auth.signup')}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
