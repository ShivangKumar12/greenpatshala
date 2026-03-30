// server/controllers/settingsController.ts - PRODUCTION READY
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { siteSettings } from '@shared/schema';

// ============================================
// GET SITE SETTINGS
// ============================================
export const getSettings = async (req: Request, res: Response) => {
  try {
    // Get the first (and only) settings row
    const [settings] = await db
      .select()
      .from(siteSettings)
      .limit(1);

    // If no settings exist, create default settings
    if (!settings) {
      const [newSettings] = await db
        .insert(siteSettings)
        .values({
          siteName: 'Unchi Udaan',
          contactEmail: 'info@unchiudaan.com',
          contactPhone: '+91-9876543210',
          contactAddress: 'New Delhi, India',
          facebookUrl: 'https://facebook.com/unchiudaan',
          instagramUrl: 'https://instagram.com/unchiudaan',
          linkedinUrl: 'https://linkedin.com/company/unchiudaan',
          whatsappNumber: '+919876543210',
          telegramUrl: 'https://t.me/unchiudaan',
          metaTitle: 'Unchi Udaan - Government Exam Preparation Platform',
          metaDescription: 'Prepare for UPSC, SSC, Banking, Railway and other government exams with expert guidance, comprehensive courses, and quality study materials.',
          metaKeywords: 'government exams, UPSC preparation, SSC CGL, banking exams, railway exams, online courses, study materials',
        }).$returningId();

      const [createdSettings] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.id, newSettings.id))
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
    console.error('[getSettings] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message,
    });
  }
};

// ============================================
// UPDATE SITE SETTINGS
// ============================================
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const {
      siteName,
      logo,
      favicon,
      contactEmail,
      contactPhone,
      contactAddress,
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      whatsappNumber,
      telegramUrl,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;

    // Validate required fields
    if (!siteName || siteName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Site name is required',
      });
    }

    // Validate email format if provided
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate URLs if provided
    const urlFields = [
      { field: facebookUrl, name: 'Facebook URL' },
      { field: instagramUrl, name: 'Instagram URL' },
      { field: linkedinUrl, name: 'LinkedIn URL' },
      { field: telegramUrl, name: 'Telegram URL' },
    ];

    for (const { field, name } of urlFields) {
      if (field && field.trim() !== '' && !field.startsWith('http')) {
        return res.status(400).json({
          success: false,
          message: `${name} must start with http:// or https://`,
        });
      }
    }

    // Get existing settings
    const [existingSettings] = await db
      .select()
      .from(siteSettings)
      .limit(1);

    if (!existingSettings) {
      // Create new settings if none exist
      await db.insert(siteSettings).values({
        siteName: siteName.trim(),
        logo: logo || null,
        favicon: favicon || null,
        contactEmail: contactEmail?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        contactAddress: contactAddress?.trim() || null,
        facebookUrl: facebookUrl?.trim() || null,
        instagramUrl: instagramUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        whatsappNumber: whatsappNumber?.trim() || null,
        telegramUrl: telegramUrl?.trim() || null,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        metaKeywords: metaKeywords?.trim() || null,
      });
    } else {
      // Update existing settings
      await db
        .update(siteSettings)
        .set({
          siteName: siteName.trim(),
          logo: logo || existingSettings.logo,
          favicon: favicon || existingSettings.favicon,
          contactEmail: contactEmail?.trim() || existingSettings.contactEmail,
          contactPhone: contactPhone?.trim() || existingSettings.contactPhone,
          contactAddress: contactAddress?.trim() || existingSettings.contactAddress,
          facebookUrl: facebookUrl?.trim() || existingSettings.facebookUrl,
          instagramUrl: instagramUrl?.trim() || existingSettings.instagramUrl,
          linkedinUrl: linkedinUrl?.trim() || existingSettings.linkedinUrl,
          whatsappNumber: whatsappNumber?.trim() || existingSettings.whatsappNumber,
          telegramUrl: telegramUrl?.trim() || existingSettings.telegramUrl,
          metaTitle: metaTitle?.trim() || existingSettings.metaTitle,
          metaDescription: metaDescription?.trim() || existingSettings.metaDescription,
          metaKeywords: metaKeywords?.trim() || existingSettings.metaKeywords,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, existingSettings.id));
    }

    // Fetch updated settings
    const [updatedSettings] = await db
      .select()
      .from(siteSettings)
      .limit(1);

    console.log('[updateSettings] Settings updated successfully');

    await invalidateCache('api_cache:GET:/api/settings*');
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error: any) {
    console.error('[updateSettings] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    });
  }
};

// ============================================
// GET PUBLIC SETTINGS (No Auth Required)
// ============================================
export const getPublicSettings = async (req: Request, res: Response) => {
  try {
    const [settings] = await db
      .select({
        siteName: siteSettings.siteName,
        logo: siteSettings.logo,
        favicon: siteSettings.favicon,
        contactEmail: siteSettings.contactEmail,
        contactPhone: siteSettings.contactPhone,
        contactAddress: siteSettings.contactAddress,
        facebookUrl: siteSettings.facebookUrl,
        instagramUrl: siteSettings.instagramUrl,
        linkedinUrl: siteSettings.linkedinUrl,
        whatsappNumber: siteSettings.whatsappNumber,
        telegramUrl: siteSettings.telegramUrl,
        metaTitle: siteSettings.metaTitle,
        metaDescription: siteSettings.metaDescription,
        metaKeywords: siteSettings.metaKeywords,
      })
      .from(siteSettings)
      .limit(1);

    if (!settings) {
      return res.json({
        success: true,
        settings: {
          siteName: 'Unchi Udaan',
          logo: null,
          favicon: null,
          contactEmail: null,
          contactPhone: null,
          contactAddress: null,
          facebookUrl: null,
          instagramUrl: null,
          linkedinUrl: null,
          whatsappNumber: null,
          telegramUrl: null,
          metaTitle: 'Unchi Udaan',
          metaDescription: null,
          metaKeywords: null,
        },
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('[getPublicSettings] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message,
    });
  }
};
