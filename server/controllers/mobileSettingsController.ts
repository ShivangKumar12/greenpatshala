// server/controllers/mobileSettingsController.ts - Mobile App Settings
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { mobileAppSettings } from '@shared/schema';

// ============================================
// GET MOBILE APP SETTINGS (Admin)
// ============================================
export const getMobileSettings = async (req: Request, res: Response) => {
  try {
    const [settings] = await db
      .select()
      .from(mobileAppSettings)
      .limit(1);

    // If no settings exist, create defaults
    if (!settings) {
      const [newSettings] = await db
        .insert(mobileAppSettings)
        .values({
          appName: 'Unchi Udaan',
          appVersion: '1.0.0',
          minAppVersion: '1.0.0',
          maintenanceMode: false,
          forceUpdate: false,
          notificationsEnabled: true,
          bannersEnabled: true,
          banners: JSON.stringify([]),
          adsEnabled: false,
          adFrequency: 5,
          showCourses: true,
          showQuizzes: true,
          showJobs: true,
          showCurrentAffairs: true,
          showStudyMaterials: true,
          showLiveClasses: false,
          popupEnabled: false,
          adInterstitialEnabled: false,
        }).$returningId();

      const [createdSettings] = await db
        .select()
        .from(mobileAppSettings)
        .where(eq(mobileAppSettings.id, newSettings.id))
        .limit(1);

      return res.json({
        success: true,
        settings: createdSettings,
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('[getMobileSettings] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mobile settings',
    });
  }
};

// ============================================
// UPDATE MOBILE APP SETTINGS (Admin)
// ============================================
export const updateMobileSettings = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Get existing settings
    const [existingSettings] = await db
      .select()
      .from(mobileAppSettings)
      .limit(1);

    const updateData: Record<string, any> = {};

    // General App Config
    if (body.appName !== undefined) updateData.appName = body.appName.trim();
    if (body.appVersion !== undefined) updateData.appVersion = body.appVersion.trim();
    if (body.minAppVersion !== undefined) updateData.minAppVersion = body.minAppVersion.trim();
    if (body.maintenanceMode !== undefined) updateData.maintenanceMode = !!body.maintenanceMode;
    if (body.maintenanceMessage !== undefined) updateData.maintenanceMessage = body.maintenanceMessage?.trim() || null;
    if (body.forceUpdate !== undefined) updateData.forceUpdate = !!body.forceUpdate;
    if (body.updateUrl !== undefined) updateData.updateUrl = body.updateUrl?.trim() || null;

    // Push Notifications
    if (body.notificationsEnabled !== undefined) updateData.notificationsEnabled = !!body.notificationsEnabled;
    if (body.notificationTitle !== undefined) updateData.notificationTitle = body.notificationTitle?.trim() || null;
    if (body.notificationBody !== undefined) updateData.notificationBody = body.notificationBody?.trim() || null;
    if (body.notificationImageUrl !== undefined) updateData.notificationImageUrl = body.notificationImageUrl?.trim() || null;
    if (body.notificationTargetScreen !== undefined) updateData.notificationTargetScreen = body.notificationTargetScreen?.trim() || null;

    // Banners
    if (body.bannersEnabled !== undefined) updateData.bannersEnabled = !!body.bannersEnabled;
    if (body.banners !== undefined) updateData.banners = typeof body.banners === 'string' ? body.banners : JSON.stringify(body.banners);

    // Advertisements
    if (body.adsEnabled !== undefined) updateData.adsEnabled = !!body.adsEnabled;
    if (body.adBannerImageUrl !== undefined) updateData.adBannerImageUrl = body.adBannerImageUrl?.trim() || null;
    if (body.adBannerLinkUrl !== undefined) updateData.adBannerLinkUrl = body.adBannerLinkUrl?.trim() || null;
    if (body.adInterstitialEnabled !== undefined) updateData.adInterstitialEnabled = !!body.adInterstitialEnabled;
    if (body.adFrequency !== undefined) updateData.adFrequency = parseInt(body.adFrequency) || 5;

    // Content Visibility
    if (body.showCourses !== undefined) updateData.showCourses = !!body.showCourses;
    if (body.showQuizzes !== undefined) updateData.showQuizzes = !!body.showQuizzes;
    if (body.showJobs !== undefined) updateData.showJobs = !!body.showJobs;
    if (body.showCurrentAffairs !== undefined) updateData.showCurrentAffairs = !!body.showCurrentAffairs;
    if (body.showStudyMaterials !== undefined) updateData.showStudyMaterials = !!body.showStudyMaterials;
    if (body.showLiveClasses !== undefined) updateData.showLiveClasses = !!body.showLiveClasses;

    // Popup / Announcement
    if (body.popupEnabled !== undefined) updateData.popupEnabled = !!body.popupEnabled;
    if (body.popupTitle !== undefined) updateData.popupTitle = body.popupTitle?.trim() || null;
    if (body.popupMessage !== undefined) updateData.popupMessage = body.popupMessage?.trim() || null;
    if (body.popupImageUrl !== undefined) updateData.popupImageUrl = body.popupImageUrl?.trim() || null;
    if (body.popupActionUrl !== undefined) updateData.popupActionUrl = body.popupActionUrl?.trim() || null;
    if (body.popupActionLabel !== undefined) updateData.popupActionLabel = body.popupActionLabel?.trim() || null;

    // Support
    if (body.supportWhatsapp !== undefined) updateData.supportWhatsapp = body.supportWhatsapp?.trim() || null;
    if (body.supportEmail !== undefined) updateData.supportEmail = body.supportEmail?.trim() || null;
    if (body.supportPhone !== undefined) updateData.supportPhone = body.supportPhone?.trim() || null;

    // API Config
    if (body.apiBaseUrl !== undefined) updateData.apiBaseUrl = body.apiBaseUrl?.trim() || null;
    if (body.apiDocsUrl !== undefined) updateData.apiDocsUrl = body.apiDocsUrl?.trim() || null;

    if (!existingSettings) {
      // Create new if none exist
      await db.insert(mobileAppSettings).values({
        ...updateData,
        appName: updateData.appName || 'Unchi Udaan',
        appVersion: updateData.appVersion || '1.0.0',
        minAppVersion: updateData.minAppVersion || '1.0.0',
      });
    } else {
      // Update existing
      await db
        .update(mobileAppSettings)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(mobileAppSettings.id, existingSettings.id));
    }

    // Fetch updated settings
    const [updatedSettings] = await db
      .select()
      .from(mobileAppSettings)
      .limit(1);

    console.log('[updateMobileSettings] Settings updated successfully');

    await invalidateCache('api_cache:GET:/api/mobile-settings*');
    await invalidateCache('api_cache:GET:/api/admin/mobile-settings*');

    res.json({
      success: true,
      message: 'Mobile app settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error: any) {
    console.error('[updateMobileSettings] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update mobile settings',
    });
  }
};

// ============================================
// GET PUBLIC MOBILE SETTINGS (For Mobile App - No Auth)
// ============================================
export const getPublicMobileSettings = async (req: Request, res: Response) => {
  try {
    const [settings] = await db
      .select()
      .from(mobileAppSettings)
      .limit(1);

    if (!settings) {
      return res.json({
        success: true,
        settings: {
          appName: 'Unchi Udaan',
          appVersion: '1.0.0',
          minAppVersion: '1.0.0',
          maintenanceMode: false,
          forceUpdate: false,
          notificationsEnabled: true,
          bannersEnabled: true,
          banners: [],
          adsEnabled: false,
          showCourses: true,
          showQuizzes: true,
          showJobs: true,
          showCurrentAffairs: true,
          showStudyMaterials: true,
          showLiveClasses: false,
          popupEnabled: false,
          supportWhatsapp: null,
          supportEmail: null,
          supportPhone: null,
          apiBaseUrl: null,
          apiDocsUrl: null,
        },
      });
    }

    // Return only what the mobile app needs (no internal admin fields)
    res.json({
      success: true,
      settings: {
        appName: settings.appName,
        appVersion: settings.appVersion,
        minAppVersion: settings.minAppVersion,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        forceUpdate: settings.forceUpdate,
        updateUrl: settings.updateUrl,
        notificationsEnabled: settings.notificationsEnabled,
        bannersEnabled: settings.bannersEnabled,
        banners: settings.banners,
        adsEnabled: settings.adsEnabled,
        adBannerImageUrl: settings.adBannerImageUrl,
        adBannerLinkUrl: settings.adBannerLinkUrl,
        adInterstitialEnabled: settings.adInterstitialEnabled,
        adFrequency: settings.adFrequency,
        showCourses: settings.showCourses,
        showQuizzes: settings.showQuizzes,
        showJobs: settings.showJobs,
        showCurrentAffairs: settings.showCurrentAffairs,
        showStudyMaterials: settings.showStudyMaterials,
        showLiveClasses: settings.showLiveClasses,
        popupEnabled: settings.popupEnabled,
        popupTitle: settings.popupTitle,
        popupMessage: settings.popupMessage,
        popupImageUrl: settings.popupImageUrl,
        popupActionUrl: settings.popupActionUrl,
        popupActionLabel: settings.popupActionLabel,
        supportWhatsapp: settings.supportWhatsapp,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        apiBaseUrl: settings.apiBaseUrl,
        apiDocsUrl: settings.apiDocsUrl,
      },
    });
  } catch (error: any) {
    console.error('[getPublicMobileSettings] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mobile settings',
    });
  }
};
