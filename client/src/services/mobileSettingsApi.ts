// client/src/services/mobileSettingsApi.ts
import apiClient from '@/lib/axios';

// ============================================
// TYPES
// ============================================

export interface BannerItem {
  imageUrl: string;
  title: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
}

export interface MobileAppSettings {
  id?: number;

  // General
  appName: string;
  appVersion: string;
  minAppVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  forceUpdate: boolean;
  updateUrl: string | null;

  // Notifications
  notificationsEnabled: boolean;
  notificationTitle: string | null;
  notificationBody: string | null;
  notificationImageUrl: string | null;
  notificationTargetScreen: string | null;

  // Banners
  bannersEnabled: boolean;
  banners: BannerItem[] | string | null;

  // Ads
  adsEnabled: boolean;
  adBannerImageUrl: string | null;
  adBannerLinkUrl: string | null;
  adInterstitialEnabled: boolean;
  adFrequency: number;

  // Content Visibility
  showCourses: boolean;
  showQuizzes: boolean;
  showJobs: boolean;
  showCurrentAffairs: boolean;
  showStudyMaterials: boolean;
  showLiveClasses: boolean;

  // Popup
  popupEnabled: boolean;
  popupTitle: string | null;
  popupMessage: string | null;
  popupImageUrl: string | null;
  popupActionUrl: string | null;
  popupActionLabel: string | null;

  // Support
  supportWhatsapp: string | null;
  supportEmail: string | null;
  supportPhone: string | null;

  // API Config
  apiBaseUrl: string | null;
  apiDocsUrl: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface MobileSettingsResponse {
  success: boolean;
  settings: MobileAppSettings;
  message?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export const getMobileSettings = async (): Promise<MobileAppSettings> => {
  const { data } = await apiClient.get<MobileSettingsResponse>('/admin/mobile-settings');
  return data.settings;
};

export const updateMobileSettings = async (
  settings: Partial<MobileAppSettings>
): Promise<MobileSettingsResponse> => {
  const { data } = await apiClient.put<MobileSettingsResponse>('/admin/mobile-settings', settings);
  return data;
};
