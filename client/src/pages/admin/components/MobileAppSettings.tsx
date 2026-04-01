// client/src/pages/admin/components/MobileAppSettings.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Smartphone,
  Bell,
  Image as ImageIcon,
  Megaphone,
  Eye,
  MessageSquareText,
  HeadphonesIcon,
  Save,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Shield,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  ToggleLeft,
  Copy,
  Check,
  Globe,
  Link2,
  Server,
} from 'lucide-react';

import {
  getMobileSettings,
  updateMobileSettings,
  type MobileAppSettings as MobileSettings,
  type BannerItem,
} from '@/services/mobileSettingsApi';

// ============================================
// TOGGLE ROW COMPONENT
// ============================================
function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  icon: Icon,
  iconColor = 'text-primary',
  badge,
  badgeVariant = 'default',
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  icon?: any;
  iconColor?: string;
  badge?: string;
  badgeVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2 rounded-lg bg-muted/60 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{label}</p>
            {badge && (
              <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                {badge}
              </Badge>
            )}
          </div>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ============================================
// SECTION HEADER
// ============================================
function SectionHeader({
  icon: Icon,
  title,
  description,
  iconColor = 'text-primary',
  bgColor = 'bg-primary/10',
}: {
  icon: any;
  title: string;
  description: string;
  iconColor?: string;
  bgColor?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className={`p-2.5 rounded-xl ${bgColor}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function MobileAppSettingsComponent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<MobileSettings>({
    appName: 'Unchi Udaan',
    appVersion: '1.0.0',
    minAppVersion: '1.0.0',
    maintenanceMode: false,
    maintenanceMessage: null,
    forceUpdate: false,
    updateUrl: null,
    notificationsEnabled: true,
    notificationTitle: null,
    notificationBody: null,
    notificationImageUrl: null,
    notificationTargetScreen: null,
    bannersEnabled: true,
    banners: [],
    adsEnabled: false,
    adBannerImageUrl: null,
    adBannerLinkUrl: null,
    adInterstitialEnabled: false,
    adFrequency: 5,
    showCourses: true,
    showQuizzes: true,
    showJobs: true,
    showCurrentAffairs: true,
    showStudyMaterials: true,
    showLiveClasses: false,
    popupEnabled: false,
    popupTitle: null,
    popupMessage: null,
    popupImageUrl: null,
    popupActionUrl: null,
    popupActionLabel: null,
    supportWhatsapp: null,
    supportEmail: null,
    supportPhone: null,
    apiBaseUrl: null,
    apiDocsUrl: null,
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: 'Copied!', description: `${field} copied to clipboard` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMobileSettings();
      // Parse banners if it's a string
      let banners: BannerItem[] = [];
      if (data.banners) {
        if (typeof data.banners === 'string') {
          try { banners = JSON.parse(data.banners); } catch { banners = []; }
        } else if (Array.isArray(data.banners)) {
          banners = data.banners;
        }
      }
      setSettings({ ...data, banners });
    } catch (err: any) {
      console.error('Failed to fetch mobile settings:', err);
      setError(err.response?.data?.message || 'Failed to load mobile settings');
      toast({ title: 'Error', description: 'Failed to load mobile settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateMobileSettings(settings);
      toast({ title: '✅ Changes Saved', description: 'Mobile app settings updated successfully' });
      await fetchSettings();
    } catch (err: any) {
      console.error('Save error:', err);
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Banner helpers
  const parsedBanners: BannerItem[] = (() => {
    if (!settings.banners) return [];
    if (typeof settings.banners === 'string') {
      try { return JSON.parse(settings.banners); } catch { return []; }
    }
    return settings.banners as BannerItem[];
  })();

  const addBanner = () => {
    const newBanner: BannerItem = {
      imageUrl: '',
      title: '',
      linkUrl: '',
      isActive: true,
      order: parsedBanners.length,
    };
    setSettings({ ...settings, banners: [...parsedBanners, newBanner] });
  };

  const updateBanner = (index: number, field: keyof BannerItem, value: any) => {
    const updated = [...parsedBanners];
    (updated[index] as any)[field] = value;
    setSettings({ ...settings, banners: updated });
  };

  const removeBanner = (index: number) => {
    const updated = parsedBanners.filter((_, i) => i !== index);
    setSettings({ ...settings, banners: updated });
  };

  const update = (field: keyof MobileSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading mobile settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <Smartphone className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>
            Mobile App Settings
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Control your mobile app content, notifications, banners, and more
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={loading} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Status Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <Badge
          variant={settings.maintenanceMode ? 'destructive' : 'default'}
          className={`gap-1.5 py-1 px-3 ${!settings.maintenanceMode ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-200' : ''}`}
        >
          {settings.maintenanceMode ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
          {settings.maintenanceMode ? 'Maintenance Mode ON' : 'App Live'}
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1 px-3">
          <Smartphone className="w-3 h-3" />
          v{settings.appVersion || '1.0.0'}
        </Badge>
        {settings.notificationsEnabled && (
          <Badge variant="outline" className="gap-1.5 py-1 px-3 text-blue-600 border-blue-200 dark:border-blue-800">
            <Bell className="w-3 h-3" />
            Notifications On
          </Badge>
        )}
        {settings.popupEnabled && (
          <Badge variant="outline" className="gap-1.5 py-1 px-3 text-orange-600 border-orange-200">
            <MessageSquareText className="w-3 h-3" />
            Popup Active
          </Badge>
        )}
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/70 p-1.5 inline-flex flex-wrap h-auto rounded-xl border shadow-inner gap-0.5">
            <TabsTrigger value="general" className="rounded-lg px-3.5 py-2 text-sm font-medium gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg px-3.5 py-2 text-sm font-medium gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="banners" className="rounded-lg px-3.5 py-2 text-sm font-medium gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Banners
            </TabsTrigger>
            <TabsTrigger value="ads" className="rounded-lg px-3.5 py-2 text-sm font-medium gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              Ads
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg px-3.5 py-2 text-sm font-medium gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Content
            </TabsTrigger>
            <TabsTrigger value="popup" className="rounded-lg px-3.5 py-2 text-sm font-medium gap-1.5">
              <MessageSquareText className="w-3.5 h-3.5" />
              Popup
            </TabsTrigger>
            <TabsTrigger value="support" className="rounded-lg px-3.5 py-2 text-sm font-medium gap-1.5">
              <HeadphonesIcon className="w-3.5 h-3.5" />
              Support
            </TabsTrigger>
            <TabsTrigger value="api" className="rounded-lg px-3.5 py-2 text-sm font-medium gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              API
            </TabsTrigger>
          </TabsList>

          {/* ==================== GENERAL ==================== */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader
                  icon={Shield}
                  title="App Configuration"
                  description="General mobile app settings and version management"
                  iconColor="text-violet-600"
                  bgColor="bg-violet-100 dark:bg-violet-900/30"
                />
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>App Name</Label>
                    <Input
                      value={settings.appName || ''}
                      onChange={(e) => update('appName', e.target.value)}
                      placeholder="Unchi Udaan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Version</Label>
                    <Input
                      value={settings.appVersion || ''}
                      onChange={(e) => update('appVersion', e.target.value)}
                      placeholder="1.0.0"
                    />
                    <p className="text-xs text-muted-foreground">Latest released version</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Required Version</Label>
                    <Input
                      value={settings.minAppVersion || ''}
                      onChange={(e) => update('minAppVersion', e.target.value)}
                      placeholder="1.0.0"
                    />
                    <p className="text-xs text-muted-foreground">Users below this must update</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <ToggleRow
                    label="Force Update"
                    description="Require users to update before using the app"
                    checked={settings.forceUpdate}
                    onCheckedChange={(v) => update('forceUpdate', v)}
                    icon={RefreshCcw}
                    iconColor="text-blue-600"
                    badge={settings.forceUpdate ? 'Active' : undefined}
                    badgeVariant="destructive"
                  />

                  {settings.forceUpdate && (
                    <div className="space-y-2 pl-12">
                      <Label>Update URL (Play Store / App Store)</Label>
                      <Input
                        value={settings.updateUrl || ''}
                        onChange={(e) => update('updateUrl', e.target.value)}
                        placeholder="https://play.google.com/store/apps/details?id=..."
                      />
                    </div>
                  )}

                  <ToggleRow
                    label="Maintenance Mode"
                    description="Show maintenance screen to all app users"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(v) => update('maintenanceMode', v)}
                    icon={WifiOff}
                    iconColor="text-red-600"
                    badge={settings.maintenanceMode ? 'App Offline' : undefined}
                    badgeVariant="destructive"
                  />

                  {settings.maintenanceMode && (
                    <div className="space-y-2 pl-12">
                      <Label>Maintenance Message</Label>
                      <Textarea
                        value={settings.maintenanceMessage || ''}
                        onChange={(e) => update('maintenanceMessage', e.target.value)}
                        placeholder="We are performing scheduled maintenance. Please check back soon!"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== NOTIFICATIONS ==================== */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader
                  icon={Bell}
                  title="Push Notifications"
                  description="Configure push notification settings for the mobile app"
                  iconColor="text-blue-600"
                  bgColor="bg-blue-100 dark:bg-blue-900/30"
                />
              </CardHeader>
              <CardContent className="space-y-5">
                <ToggleRow
                  label="Enable Push Notifications"
                  description="Allow sending push notifications to app users"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(v) => update('notificationsEnabled', v)}
                  icon={Bell}
                  iconColor="text-blue-600"
                />

                {settings.notificationsEnabled && (
                  <>
                    <Separator />
                    <div className="space-y-1 mb-3">
                      <p className="font-medium text-sm">Default Notification Template</p>
                      <p className="text-xs text-muted-foreground">Set a default notification that can be sent to all users</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={settings.notificationTitle || ''}
                          onChange={(e) => update('notificationTitle', e.target.value)}
                          placeholder="📢 New Quiz Available!"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Target Screen</Label>
                        <Input
                          value={settings.notificationTargetScreen || ''}
                          onChange={(e) => update('notificationTargetScreen', e.target.value)}
                          placeholder="home, quizzes, courses..."
                        />
                        <p className="text-xs text-muted-foreground">Screen to open when user taps notification</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Body</Label>
                      <Textarea
                        value={settings.notificationBody || ''}
                        onChange={(e) => update('notificationBody', e.target.value)}
                        placeholder="New SSC CGL quiz is live now! Attempt it before the deadline."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL (optional)</Label>
                      <Input
                        value={settings.notificationImageUrl || ''}
                        onChange={(e) => update('notificationImageUrl', e.target.value)}
                        placeholder="https://example.com/notification-image.jpg"
                      />
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-muted rounded-xl space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">📱 Notification Preview</p>
                      <div className="bg-background border rounded-xl p-4 flex items-start gap-3 max-w-md shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                          <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{settings.notificationTitle || 'Notification Title'}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {settings.notificationBody || 'Notification body text will appear here...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== BANNERS ==================== */}
          <TabsContent value="banners" className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader
                  icon={ImageIcon}
                  title="Home Banners / Carousel"
                  description="Manage promotional banners on the app's home screen"
                  iconColor="text-emerald-600"
                  bgColor="bg-emerald-100 dark:bg-emerald-900/30"
                />
              </CardHeader>
              <CardContent className="space-y-5">
                <ToggleRow
                  label="Enable Banners"
                  description="Show promotional banner carousel on home screen"
                  checked={settings.bannersEnabled}
                  onCheckedChange={(v) => update('bannersEnabled', v)}
                  icon={ImageIcon}
                  iconColor="text-emerald-600"
                />

                {settings.bannersEnabled && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">Banner Items ({parsedBanners.length})</p>
                      <Button variant="outline" size="sm" onClick={addBanner} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        Add Banner
                      </Button>
                    </div>

                    {parsedBanners.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No banners added yet. Click "Add Banner" to create one.</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {parsedBanners.map((banner, index) => (
                        <div
                          key={index}
                          className="border rounded-xl p-4 bg-card hover:border-primary/30 transition-colors space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              <Badge variant="outline" className="text-xs">Banner #{index + 1}</Badge>
                              {banner.isActive ? (
                                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Switch
                                checked={banner.isActive}
                                onCheckedChange={(v) => updateBanner(index, 'isActive', v)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeBanner(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={banner.title}
                                onChange={(e) => updateBanner(index, 'title', e.target.value)}
                                placeholder="Banner title"
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Image URL</Label>
                              <Input
                                value={banner.imageUrl}
                                onChange={(e) => updateBanner(index, 'imageUrl', e.target.value)}
                                placeholder="https://..."
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Link URL (on tap)</Label>
                              <Input
                                value={banner.linkUrl}
                                onChange={(e) => updateBanner(index, 'linkUrl', e.target.value)}
                                placeholder="https://... or screen://quizzes"
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== ADS ==================== */}
          <TabsContent value="ads" className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader
                  icon={Megaphone}
                  title="Advertisements"
                  description="Control ad placements within the mobile app"
                  iconColor="text-amber-600"
                  bgColor="bg-amber-100 dark:bg-amber-900/30"
                />
              </CardHeader>
              <CardContent className="space-y-5">
                <ToggleRow
                  label="Enable Advertisements"
                  description="Show ads inside the mobile app"
                  checked={settings.adsEnabled}
                  onCheckedChange={(v) => update('adsEnabled', v)}
                  icon={Megaphone}
                  iconColor="text-amber-600"
                />

                {settings.adsEnabled && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ad Banner Image URL</Label>
                        <Input
                          value={settings.adBannerImageUrl || ''}
                          onChange={(e) => update('adBannerImageUrl', e.target.value)}
                          placeholder="https://example.com/ad-banner.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ad Banner Click URL</Label>
                        <Input
                          value={settings.adBannerLinkUrl || ''}
                          onChange={(e) => update('adBannerLinkUrl', e.target.value)}
                          placeholder="https://sponsor-site.com"
                        />
                      </div>
                    </div>

                    <Separator />

                    <ToggleRow
                      label="Interstitial Ads"
                      description="Show full-screen ads between screen transitions"
                      checked={settings.adInterstitialEnabled}
                      onCheckedChange={(v) => update('adInterstitialEnabled', v)}
                      icon={ExternalLink}
                      iconColor="text-orange-600"
                    />

                    {settings.adInterstitialEnabled && (
                      <div className="space-y-2 pl-12">
                        <Label>Show ad every N screens</Label>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={settings.adFrequency}
                          onChange={(e) => update('adFrequency', parseInt(e.target.value) || 5)}
                          className="w-32"
                        />
                        <p className="text-xs text-muted-foreground">
                          Currently: show ad every {settings.adFrequency} screen views
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== CONTENT VISIBILITY ==================== */}
          <TabsContent value="content" className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader
                  icon={Eye}
                  title="Content Visibility"
                  description="Choose which sections are visible in the mobile app"
                  iconColor="text-indigo-600"
                  bgColor="bg-indigo-100 dark:bg-indigo-900/30"
                />
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleRow
                  label="Courses"
                  description="Show course listings and enrollment"
                  checked={settings.showCourses}
                  onCheckedChange={(v) => update('showCourses', v)}
                  icon={ToggleLeft}
                  iconColor="text-blue-600"
                />
                <ToggleRow
                  label="Quizzes"
                  description="Show quiz section and practice tests"
                  checked={settings.showQuizzes}
                  onCheckedChange={(v) => update('showQuizzes', v)}
                  icon={ToggleLeft}
                  iconColor="text-purple-600"
                />
                <ToggleRow
                  label="Job Portal"
                  description="Show government job listings"
                  checked={settings.showJobs}
                  onCheckedChange={(v) => update('showJobs', v)}
                  icon={ToggleLeft}
                  iconColor="text-green-600"
                />
                <ToggleRow
                  label="Current Affairs"
                  description="Show daily current affairs updates"
                  checked={settings.showCurrentAffairs}
                  onCheckedChange={(v) => update('showCurrentAffairs', v)}
                  icon={ToggleLeft}
                  iconColor="text-orange-600"
                />
                <ToggleRow
                  label="Study Materials"
                  description="Show downloadable PDFs and resources"
                  checked={settings.showStudyMaterials}
                  onCheckedChange={(v) => update('showStudyMaterials', v)}
                  icon={ToggleLeft}
                  iconColor="text-indigo-600"
                />
                <ToggleRow
                  label="Live Classes"
                  description="Show live classes section (coming soon)"
                  checked={settings.showLiveClasses}
                  onCheckedChange={(v) => update('showLiveClasses', v)}
                  icon={ToggleLeft}
                  iconColor="text-pink-600"
                  badge="Coming Soon"
                  badgeVariant="secondary"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== POPUP ==================== */}
          <TabsContent value="popup" className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader
                  icon={MessageSquareText}
                  title="Popup / Announcement"
                  description="Show a one-time popup when users open the app"
                  iconColor="text-orange-600"
                  bgColor="bg-orange-100 dark:bg-orange-900/30"
                />
              </CardHeader>
              <CardContent className="space-y-5">
                <ToggleRow
                  label="Enable Popup"
                  description="Show announcement popup to users on app launch"
                  checked={settings.popupEnabled}
                  onCheckedChange={(v) => update('popupEnabled', v)}
                  icon={MessageSquareText}
                  iconColor="text-orange-600"
                />

                {settings.popupEnabled && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Popup Title</Label>
                        <Input
                          value={settings.popupTitle || ''}
                          onChange={(e) => update('popupTitle', e.target.value)}
                          placeholder="🎉 New Feature!"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Action Button Label</Label>
                        <Input
                          value={settings.popupActionLabel || ''}
                          onChange={(e) => update('popupActionLabel', e.target.value)}
                          placeholder="Learn More"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Popup Message</Label>
                      <Textarea
                        value={settings.popupMessage || ''}
                        onChange={(e) => update('popupMessage', e.target.value)}
                        placeholder="We have launched new SSC CGL mock tests! Take them now to boost your preparation."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Image URL (optional)</Label>
                        <Input
                          value={settings.popupImageUrl || ''}
                          onChange={(e) => update('popupImageUrl', e.target.value)}
                          placeholder="https://example.com/popup-image.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Action URL (optional)</Label>
                        <Input
                          value={settings.popupActionUrl || ''}
                          onChange={(e) => update('popupActionUrl', e.target.value)}
                          placeholder="https://... or screen://quizzes"
                        />
                      </div>
                    </div>

                    {/* Popup Preview */}
                    <div className="p-4 bg-muted rounded-xl space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">📱 Popup Preview</p>
                      <div className="bg-background border rounded-2xl p-6 max-w-sm mx-auto shadow-lg text-center space-y-3">
                        {settings.popupImageUrl && (
                          <img
                            src={settings.popupImageUrl}
                            alt="Popup"
                            className="w-full h-32 object-cover rounded-xl"
                            onError={(e) => { (e.target as any).style.display = 'none'; }}
                          />
                        )}
                        <h3 className="font-bold text-lg">{settings.popupTitle || 'Popup Title'}</h3>
                        <p className="text-sm text-muted-foreground">{settings.popupMessage || 'Popup message...'}</p>
                        {settings.popupActionLabel && (
                          <Button size="sm" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                            {settings.popupActionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== SUPPORT ==================== */}
          <TabsContent value="support" className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader
                  icon={HeadphonesIcon}
                  title="In-App Support"
                  description="Contact methods shown in the app's help / support section"
                  iconColor="text-teal-600"
                  bgColor="bg-teal-100 dark:bg-teal-900/30"
                />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span className="text-green-600">💬</span>
                    WhatsApp Support Number
                  </Label>
                  <Input
                    value={settings.supportWhatsapp || ''}
                    onChange={(e) => update('supportWhatsapp', e.target.value)}
                    placeholder="+919876543210"
                  />
                  <p className="text-xs text-muted-foreground">Include country code (e.g., +91 for India)</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span className="text-blue-600">✉️</span>
                    Support Email
                  </Label>
                  <Input
                    type="email"
                    value={settings.supportEmail || ''}
                    onChange={(e) => update('supportEmail', e.target.value)}
                    placeholder="support@unchiudaan.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span className="text-green-600">📞</span>
                    Support Phone
                  </Label>
                  <Input
                    type="tel"
                    value={settings.supportPhone || ''}
                    onChange={(e) => update('supportPhone', e.target.value)}
                    placeholder="+91-9876543210"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== API CONFIG ==================== */}
          <TabsContent value="api" className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader
                  icon={Globe}
                  title="API Connection"
                  description="API URLs for connecting the mobile app to the backend"
                  iconColor="text-sky-600"
                  bgColor="bg-sky-100 dark:bg-sky-900/30"
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main API URL - Prominent Display */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 text-white space-y-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-sky-400" />
                    <h4 className="font-semibold text-sm text-sky-300 uppercase tracking-wider">API Base URL</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/30 rounded-xl px-4 py-3 text-base font-mono tracking-wide text-emerald-400 border border-white/10 break-all">
                      {settings.apiBaseUrl || 'Not configured yet'}
                    </code>
                    {settings.apiBaseUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-xl text-white hover:bg-white/10 flex-shrink-0"
                        onClick={() => copyToClipboard(settings.apiBaseUrl!, 'API Base URL')}
                      >
                        {copiedField === 'API Base URL' ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Use this URL in your mobile app's API configuration (e.g., axios baseURL)
                  </p>
                </div>

                {/* Editable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-sky-600" />
                      API Base URL
                    </Label>
                    <Input
                      value={settings.apiBaseUrl || ''}
                      onChange={(e) => update('apiBaseUrl', e.target.value)}
                      placeholder="https://api.unchiudaan.com/api"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      The root URL your mobile app uses to make API calls
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      API Documentation URL
                    </Label>
                    <Input
                      value={settings.apiDocsUrl || ''}
                      onChange={(e) => update('apiDocsUrl', e.target.value)}
                      placeholder="https://docs.unchiudaan.com"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link to your API documentation (Swagger, Postman, etc.)
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Public Config Endpoint */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Server className="w-4 h-4 text-muted-foreground" />
                    Quick Reference — Available Endpoints
                  </h4>
                  <div className="space-y-2">
                    {[
                      { method: 'GET', path: '/api/mobile-settings/public', desc: 'Mobile app config (no auth, cached 5min)' },
                      { method: 'GET', path: '/api/auth/login', desc: 'User authentication' },
                      { method: 'GET', path: '/api/courses', desc: 'Course listings' },
                      { method: 'GET', path: '/api/quizzes', desc: 'Quiz listings' },
                      { method: 'GET', path: '/api/jobs', desc: 'Job portal' },
                      { method: 'GET', path: '/api/current-affairs', desc: 'Current affairs' },
                      { method: 'GET', path: '/api/study-materials', desc: 'Study materials' },
                      { method: 'GET', path: '/api/settings/public', desc: 'Site settings (branding, socials)' },
                    ].map((endpoint, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 flex-shrink-0"
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono text-primary flex-1 break-all">{endpoint.path}</code>
                        <span className="text-xs text-muted-foreground hidden sm:inline flex-shrink-0">{endpoint.desc}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={() => {
                            const fullUrl = settings.apiBaseUrl
                              ? `${settings.apiBaseUrl.replace(/\/api\/?$/, '')}${endpoint.path}`
                              : endpoint.path;
                            copyToClipboard(fullUrl, endpoint.path);
                          }}
                        >
                          {copiedField === endpoint.path ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Bottom Save Bar */}
      <Card className="border-violet-200 dark:border-violet-800/50 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              📱 Changes will reflect in the mobile app after the cache expires (~5 minutes)
            </p>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
