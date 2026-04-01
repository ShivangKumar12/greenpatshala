-- GreenPatshala Schema Migration: New Columns for BUG-005, BUG-023, BUG-024
-- MySQL 8.0 compatible (no IF NOT EXISTS for ADD COLUMN)

-- BUG-005: OTP Expiry
ALTER TABLE users ADD COLUMN email_verification_expires DATETIME DEFAULT NULL AFTER email_verification_token;

-- BUG-023: Two-Factor Authentication
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE AFTER google_id;
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255) DEFAULT NULL AFTER two_factor_enabled;

-- BUG-024: Notification Preferences  
ALTER TABLE users ADD COLUMN email_notifications BOOLEAN NOT NULL DEFAULT TRUE AFTER two_factor_secret;
ALTER TABLE users ADD COLUMN course_updates BOOLEAN NOT NULL DEFAULT TRUE AFTER email_notifications;
ALTER TABLE users ADD COLUMN quiz_reminders BOOLEAN NOT NULL DEFAULT TRUE AFTER course_updates;
