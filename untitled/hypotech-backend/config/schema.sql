-- ============================================================
--  HypoTech Smart Sleep Guardian  –  MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS hypotech_db;
USE hypotech_db;

-- ------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
                                     id            INT AUTO_INCREMENT PRIMARY KEY,
                                     name          VARCHAR(100)        NOT NULL,
    email         VARCHAR(150)        NOT NULL UNIQUE,
    phone         VARCHAR(20),
    password_hash VARCHAR(255)        NOT NULL,
    age_group     ENUM('Teen','YoungAdult','Adult','Senior') DEFAULT 'Adult',
    created_at    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- ------------------------------------------------------------
-- 2. SLEEP SCHEDULES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sleep_schedules (
                                               id                INT AUTO_INCREMENT PRIMARY KEY,
                                               user_id           INT          NOT NULL,
                                               sleep_time        TIME         NOT NULL DEFAULT '22:00:00',
                                               wake_time         TIME         NOT NULL DEFAULT '06:00:00',
                                               active_days       VARCHAR(20)  NOT NULL DEFAULT '0,1,2,3,4,5,6',
    wind_down_enabled TINYINT(1)   DEFAULT 1,
    wind_down_mins    INT          DEFAULT 30,
    bedtime_reminder  TINYINT(1)   DEFAULT 1,
    strict_mode       TINYINT(1)   DEFAULT 0,
    is_active         TINYINT(1)   DEFAULT 1,
    created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

-- ------------------------------------------------------------
-- 3. APPS (master list per user)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS apps (
                                    id          INT AUTO_INCREMENT PRIMARY KEY,
                                    user_id     INT          NOT NULL,
                                    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(10)  DEFAULT '📱',
    category    ENUM('Social Media','Entertainment','Gaming','Messaging','Navigation','Emergency','Other') DEFAULT 'Other',
    is_blocked  TINYINT(1)   DEFAULT 1,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

-- ------------------------------------------------------------
-- 4. BLOCK EVENTS  (each time an app was blocked)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS block_events (
                                            id          INT AUTO_INCREMENT PRIMARY KEY,
                                            user_id     INT       NOT NULL,
                                            app_id      INT       NOT NULL,
                                            blocked_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id)  REFERENCES apps(id)  ON DELETE CASCADE
    );

-- ------------------------------------------------------------
-- 5. SLEEP LOGS  (one row per night)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sleep_logs (
                                          id            INT AUTO_INCREMENT PRIMARY KEY,
                                          user_id       INT           NOT NULL,
                                          log_date      DATE          NOT NULL,
                                          planned_sleep TIME          NOT NULL,
                                          planned_wake  TIME          NOT NULL,
                                          actual_sleep  TIME,
                                          actual_wake   TIME,
                                          total_hours   DECIMAL(4,2),
    quality_score INT           CHECK (quality_score BETWEEN 0 AND 100),
    apps_blocked  INT           DEFAULT 0,
    notes         TEXT,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_date (user_id, log_date)
    );

-- ------------------------------------------------------------
-- 6. USER SETTINGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
                                             id                   INT AUTO_INCREMENT PRIMARY KEY,
                                             user_id              INT        NOT NULL UNIQUE,
                                             notif_enabled        TINYINT(1) DEFAULT 1,
    sound_enabled        TINYINT(1) DEFAULT 1,
    auto_report          TINYINT(1) DEFAULT 1,
    pin_protection       TINYINT(1) DEFAULT 1,
    cloud_sync           TINYINT(1) DEFAULT 0,
    dark_mode            TINYINT(1) DEFAULT 1,
    sleep_target_hours   INT        DEFAULT 8,
    wake_flexibility_min INT        DEFAULT 15,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

-- ------------------------------------------------------------
-- 7. EMERGENCY OVERRIDES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_overrides (
                                                   id           INT AUTO_INCREMENT PRIMARY KEY,
                                                   user_id      INT       NOT NULL,
                                                   triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                   duration_min INT       DEFAULT 15,
                                                   reason       VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

-- Add website_domain column to apps (run this if table already exists)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS website_domain VARCHAR(100) DEFAULT NULL;

-- Update default app domains
UPDATE apps SET website_domain = 'instagram.com'  WHERE name = 'Instagram';
UPDATE apps SET website_domain = 'youtube.com'    WHERE name = 'YouTube';
UPDATE apps SET website_domain = 'twitter.com'    WHERE name = 'Twitter / X';
UPDATE apps SET website_domain = 'pubg.com'       WHERE name = 'PUBG Mobile';
UPDATE apps SET website_domain = 'netflix.com'    WHERE name = 'Netflix';
UPDATE apps SET website_domain = 'snapchat.com'   WHERE name = 'Snapchat';
UPDATE apps SET website_domain = 'tiktok.com'     WHERE name = 'TikTok';
UPDATE apps SET website_domain = 'primevideo.com' WHERE name = 'Amazon Prime';
UPDATE apps SET website_domain = 'twitch.tv'      WHERE name = 'Free Fire';
UPDATE apps SET website_domain = 'facebook.com'   WHERE name = 'Facebook';