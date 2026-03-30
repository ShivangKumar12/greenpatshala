// client/src/pages/admin/components/SiteSettings.tsx - PRODUCTION READY
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Image as ImageIcon,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ✅ Import API functions
import {
  getSettings,
  updateSettings,
  uploadImage,
  validateSettings,
  type SiteSettings,
} from '@/services/settingsApi';

export default function SiteSettingsComponent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Initialize with safe defaults
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Unchi Udaan',
    logo: null,
    favicon: null,
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    whatsappNumber: '',
    telegramUrl: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  // ✅ Fetch settings with proper null handling
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettings();

      // ✅ Convert null values to empty strings for form inputs
      setSettings({
        siteName: data.siteName || 'Unchi Udaan',
        logo: data.logo || null,
        favicon: data.favicon || null,
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        contactAddress: data.contactAddress || '',
        facebookUrl: data.facebookUrl || '',
        instagramUrl: data.instagramUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        whatsappNumber: data.whatsappNumber || '',
        telegramUrl: data.telegramUrl || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
      });

      // Set previews
      if (data.logo) setLogoPreview(data.logo);
      if (data.favicon) setFaviconPreview(data.favicon);
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load settings';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload logo with better error handling
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Logo size should be less than 2MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload PNG, JPG, SVG, or WebP image',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingLogo(true);

      const { url } = await uploadImage(file, 'logo');

      setSettings((prev) => ({ ...prev, logo: url }));
      setLogoPreview(url);

      toast({
        title: 'Logo uploaded',
        description: 'Logo has been uploaded successfully',
      });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  // ✅ Upload favicon with better error handling
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast({
        title: 'File too large',
        description: 'Favicon size should be less than 500KB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/x-icon', 'image/png', 'image/jpeg', 'image/jpg', 'image/ico'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload ICO or PNG image',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingFavicon(true);

      const { url } = await uploadImage(file, 'favicon');

      setSettings((prev) => ({ ...prev, favicon: url }));
      setFaviconPreview(url);

      toast({
        title: 'Favicon uploaded',
        description: 'Favicon has been uploaded successfully',
      });
    } catch (error: any) {
      console.error('Favicon upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'Failed to upload favicon',
        variant: 'destructive',
      });
    } finally {
      setUploadingFavicon(false);
    }
  };

  // ✅ Save settings with comprehensive validation
  const handleSaveSettings = async () => {
    try {
      // Validate settings
      const validationError = validateSettings(settings);
      if (validationError) {
        toast({
          title: 'Validation Error',
          description: validationError,
          variant: 'destructive',
        });
        return;
      }

      setSaving(true);

      await updateSettings(settings);

      toast({
        title: 'Settings Saved',
        description: 'Site settings have been updated successfully',
      });

      // Refresh settings to get updated data
      await fetchSettings();
    } catch (error: any) {
      console.error('Save settings error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Site Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your website branding, contact info, and SEO
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={saving || uploadingLogo || uploadingFavicon}
          size="lg"
          className="gap-2"
        >
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

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="bg-muted p-1 w-full sm:w-auto">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Website Branding</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure your site name, logo, and favicon
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Site Name */}
              <div className="space-y-2">
                <Label>
                  Site Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={settings.siteName || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  placeholder="Enter site name (appears next to logo)"
                  className="text-lg font-semibold"
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground">
                  This name will appear next to your logo in the header
                </p>
              </div>

              {/* Logo & Favicon Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Website Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={uploadingLogo}
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer block">
                      {uploadingLogo ? (
                        <div className="space-y-2">
                          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                      ) : logoPreview || settings.logo ? (
                        <div className="space-y-3">
                          <img
                            src={logoPreview || settings.logo || ''}
                            alt="Logo preview"
                            className="h-20 mx-auto object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-logo.png';
                            }}
                          />
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-primary">Click to change</p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, SVG (max 2MB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto" />
                          <div className="space-y-1">
                            <p className="font-medium">Upload Logo</p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, SVG (max 2MB)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Recommended: 200x50px
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Favicon Upload */}
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/x-icon,image/png,image/jpeg,image/ico"
                      onChange={handleFaviconUpload}
                      className="hidden"
                      id="favicon-upload"
                      disabled={uploadingFavicon}
                    />
                    <label htmlFor="favicon-upload" className="cursor-pointer block">
                      {uploadingFavicon ? (
                        <div className="space-y-2">
                          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                      ) : faviconPreview || settings.favicon ? (
                        <div className="space-y-3">
                          <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                            <img
                              src={faviconPreview || settings.favicon || ''}
                              alt="Favicon preview"
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-favicon.png';
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-primary">Click to change</p>
                            <p className="text-xs text-muted-foreground">
                              ICO, PNG (max 500KB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto" />
                          <div className="space-y-1">
                            <p className="font-medium">Upload Favicon</p>
                            <p className="text-xs text-muted-foreground">
                              ICO, PNG (max 500KB)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Recommended: 32x32px
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {(logoPreview || settings.logo) && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <p className="text-sm font-medium">Preview:</p>

                  {/* Header Preview */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Header:</p>
                    <div className="flex items-center gap-3 p-4 bg-background rounded-md border">
                      <img
                        src={logoPreview || settings.logo || ''}
                        alt="Logo"
                        className="h-10 object-contain"
                      />
                      <span className="text-xl font-bold">{settings.siteName || 'Site Name'}</span>
                    </div>
                  </div>

                  {/* Browser Tab Preview */}
                  {(faviconPreview || settings.favicon) && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Browser Tab:</p>
                      <div className="flex items-center gap-2 p-3 bg-background rounded-md border">
                        <img
                          src={faviconPreview || settings.favicon || ''}
                          alt="Favicon"
                          className="w-4 h-4 object-contain"
                        />
                        <span className="text-sm">{settings.siteName || 'Site Name'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your contact details for users to reach you
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                  placeholder="info@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  value={settings.contactPhone || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, contactPhone: e.target.value })
                  }
                  placeholder="+91-9876543210"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Address
                </Label>
                <Textarea
                  value={settings.contactAddress || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, contactAddress: e.target.value })
                  }
                  placeholder="Enter your office address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Media Links</CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect your social media profiles
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook Page URL
                </Label>
                <Input
                  type="url"
                  value={settings.facebookUrl || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, facebookUrl: e.target.value })
                  }
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  Instagram Profile URL
                </Label>
                <Input
                  type="url"
                  value={settings.instagramUrl || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, instagramUrl: e.target.value })
                  }
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  LinkedIn Page URL
                </Label>
                <Input
                  type="url"
                  value={settings.linkedinUrl || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, linkedinUrl: e.target.value })
                  }
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  WhatsApp Number
                </Label>
                <Input
                  type="tel"
                  value={settings.whatsappNumber || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappNumber: e.target.value })
                  }
                  placeholder="+919876543210"
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +91 for India)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-500" />
                  Telegram Channel/Group URL
                </Label>
                <Input
                  type="url"
                  value={settings.telegramUrl || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, telegramUrl: e.target.value })
                  }
                  placeholder="https://t.me/yourchannel"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5" />
                SEO Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Optimize your website for search engines
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={settings.metaTitle || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, metaTitle: e.target.value })
                  }
                  placeholder="Site title for search engines"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {(settings.metaTitle || '').length}/60 characters • Recommended: 50-60
                </p>
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={settings.metaDescription || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, metaDescription: e.target.value })
                  }
                  placeholder="Brief description for search engines"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {(settings.metaDescription || '').length}/160 characters • Recommended: 150-160
                </p>
              </div>

              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <Textarea
                  value={settings.metaKeywords || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, metaKeywords: e.target.value })
                  }
                  placeholder="Comma-separated keywords"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Example: government exams, UPSC, SSC, banking exams, railway exams
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Save Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              💡 Remember to save your changes before leaving this page
            </p>
            <Button
              onClick={handleSaveSettings}
              disabled={saving || uploadingLogo || uploadingFavicon}
              size="lg"
              className="gap-2"
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
