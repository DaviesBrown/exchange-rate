-- Database Setup Script for Country Exchange Rate API
-- This script creates a dedicated MySQL user and sets up the database

-- ============================================
-- Step 1: Create Database
-- ============================================
CREATE DATABASE IF NOT EXISTS exchange_rate_db;

-- ============================================
-- Step 2: Create Dedicated User
-- ============================================
-- Replace 'your_secure_password' with a strong password
CREATE USER IF NOT EXISTS 'exchange_api_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant necessary privileges to the user
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER ON exchange_rate_db.* TO 'exchange_api_user'@'localhost';

-- Apply privileges
FLUSH PRIVILEGES;

-- ============================================
-- Step 3: Use the Database
-- ============================================
USE exchange_rate_db;

-- ============================================
-- Step 4: Create Countries Table
-- ============================================
CREATE TABLE IF NOT EXISTS countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  capital VARCHAR(255),
  region VARCHAR(100),
  population BIGINT NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate DECIMAL(20, 6),
  estimated_gdp DECIMAL(30, 2),
  flag_url TEXT,
  last_refreshed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_region (region),
  INDEX idx_currency (currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Step 5: Create Metadata Table
-- ============================================
CREATE TABLE IF NOT EXISTS metadata (
  id INT PRIMARY KEY DEFAULT 1,
  last_refreshed_at DATETIME,
  total_countries INT DEFAULT 0,
  CHECK (id = 1)
);

-- Insert default metadata
INSERT IGNORE INTO metadata (id, last_refreshed_at, total_countries)
VALUES (1, NULL, 0);

-- ============================================
-- Verification
-- ============================================
-- Show created tables
SHOW TABLES;

-- Verify user privileges
SHOW GRANTS FOR 'exchange_api_user'@'localhost';

-- ============================================
-- Security Note
-- ============================================
-- Remember to:
-- 1. Use a strong password for 'exchange_api_user'
-- 2. Update the password in your .env file
-- 3. Never commit .env file to version control
-- 4. Consider using '%' instead of 'localhost' for remote connections
--    Example: CREATE USER 'exchange_api_user'@'%' IDENTIFIED BY 'password';
