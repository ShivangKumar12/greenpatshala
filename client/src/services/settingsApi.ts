// client/src/services/settingsApi.ts - PRODUCTION READY
import apiClient from '@/lib/axios';

// ============================================
// TYPES
// ============================================

export interface SiteSettings {
  id?: number;
  siteName: string;
  logo: string | null;
  favicon: string | null;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  whatsappNumber: string;
  telegramUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettingsResponse {
  success: boolean;
  settings: SiteSettings;
  message?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get public site settings (no authentication required)
 * Used for: Footer, Header, SEO meta tags
 */
export const getPublicSettings = async (): Promise<SiteSettings> => {
  const { data } = await apiClient.get<SettingsResponse>('/settings/public');
  return data.settings;
};

/**
 * Get all site settings (admin only)
 * Used for: Admin settings page
 */
export const getSettings = async (): Promise<SiteSettings> => {
  const { data } = await apiClient.get<SettingsResponse>('/admin/settings');
  return data.settings;
};

/**
 * Update site settings (admin only)
 * @param settings - Updated settings object
 */
export const updateSettings = async (settings: Partial<SiteSettings>): Promise<SettingsResponse> => {
  const { data } = await apiClient.put<SettingsResponse>('/admin/settings', settings);
  return data;
};

/**
 * Upload logo or favicon (admin only)
 * @param file - Image file to upload
 * @param type - 'logo' or 'favicon'
 */
export const uploadImage = async (file: File, type: 'logo' | 'favicon'): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await apiClient.post<{ success: boolean; url: string }>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return { url: data.url };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate settings before submission
 */
export const validateSettings = (settings: Partial<SiteSettings>): string | null => {
  if (!settings.siteName || settings.siteName.trim() === '') {
    return 'Site name is required';
  }

  if (settings.siteName.trim().length < 2) {
    return 'Site name must be at least 2 characters';
  }

  if (settings.siteName.trim().length > 255) {
    return 'Site name must be less than 255 characters';
  }

  // Validate email format if provided
  if (settings.contactEmail && settings.contactEmail.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.contactEmail)) {
      return 'Invalid email format';
    }
  }

  // Validate URLs if provided
  const urlFields = [
    { field: settings.facebookUrl, name: 'Facebook URL' },
    { field: settings.instagramUrl, name: 'Instagram URL' },
    { field: settings.linkedinUrl, name: 'LinkedIn URL' },
    { field: settings.telegramUrl, name: 'Telegram URL' },
  ];

  for (const { field, name } of urlFields) {
    if (field && field.trim() !== '' && !field.startsWith('http')) {
      return `${name} must start with http:// or https://`;
    }
  }

  // Validate meta title length
  if (settings.metaTitle && settings.metaTitle.length > 60) {
    return 'Meta title should be less than 60 characters for best SEO';
  }

  // Validate meta description length
  if (settings.metaDescription && settings.metaDescription.length > 160) {
    return 'Meta description should be less than 160 characters for best SEO';
  }

  return null; // No errors
};

/**
 * Format phone number for WhatsApp link
 * @param phone - Phone number with or without country code
 */
export const formatWhatsAppLink = (phone: string): string => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}`;
};

/**
 * Get social media icon name
 */
export const getSocialIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'Linkedin',
    whatsapp: 'MessageCircle',
    telegram: 'Send',
  };
  return icons[platform.toLowerCase()] || 'Globe';
};

/**
 * Check if settings are loaded (not default values)
 */
export const hasCustomSettings = (settings: SiteSettings): boolean => {
  return settings.logo !== null || settings.favicon !== null || settings.id !== undefined;
};

