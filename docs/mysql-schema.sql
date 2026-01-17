-- ============================================================================
-- AMABILIA NETWORK - COMPLETE MYSQL SCHEMA
-- Production-Ready Database Schema for phpMyAdmin
-- Version: 3.0
-- Generated: 2026-01-17
-- ============================================================================

-- ============================================================================
-- 1. DROP EXISTING TABLES (for clean migration)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `loan_transactions`;
DROP TABLE IF EXISTS `loans`;
DROP TABLE IF EXISTS `task_submissions`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `wallet_transactions`;
DROP TABLE IF EXISTS `wallets`;
DROP TABLE IF EXISTS `referral_commissions`;
DROP TABLE IF EXISTS `membership_payments`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `profiles`;
DROP TABLE IF EXISTS `admins`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 2. ENUMS (MySQL doesn't have true enums, using VARCHAR with CHECK)
-- ============================================================================

-- app_role: 'admin', 'moderator', 'member'
-- loan_status: 'pending', 'active', 'repaid', 'defaulted', 'cancelled'
-- membership_tier: 'basic', 'pro', 'elite'
-- payment_status: 'pending', 'approved', 'rejected'
-- wallet_type: 'task', 'royalty', 'main'

-- ============================================================================
-- 3. PROFILES TABLE
-- ============================================================================

CREATE TABLE `profiles` (
  `id` CHAR(36) NOT NULL COMMENT 'UUID - links to auth.users in Supabase or external auth',
  `full_name` VARCHAR(200) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `referral_code` VARCHAR(10) NOT NULL,
  `referred_by` CHAR(36) DEFAULT NULL,
  `membership_tier` ENUM('basic', 'pro', 'elite') DEFAULT 'basic',
  `membership_amount` DECIMAL(12, 2) DEFAULT 0,
  `is_kyc_verified` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_profiles_referral_code` (`referral_code`),
  KEY `idx_profiles_referred_by` (`referred_by`),
  KEY `idx_profiles_membership_tier` (`membership_tier`),
  KEY `idx_profiles_created_at` (`created_at`),
  
  CONSTRAINT `fk_profiles_referred_by` FOREIGN KEY (`referred_by`) 
    REFERENCES `profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. USER ROLES TABLE (CRITICAL: Separate from profiles for security)
-- ============================================================================

CREATE TABLE `user_roles` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` CHAR(36) NOT NULL,
  `role` ENUM('admin', 'moderator', 'member') NOT NULL DEFAULT 'member',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_roles_user_role` (`user_id`, `role`),
  KEY `idx_user_roles_user_id` (`user_id`),
  KEY `idx_user_roles_role` (`role`),
  
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) 
    REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. ADMINS TABLE (Separate admin authentication)
-- ============================================================================

CREATE TABLE `admins` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Use password_hash() in PHP',
  `email` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admins_username` (`username`),
  UNIQUE KEY `uk_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. WALLETS TABLE
-- ============================================================================

CREATE TABLE `wallets` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` CHAR(36) NOT NULL,
  `wallet_type` ENUM('task', 'royalty', 'main') NOT NULL,
  `balance` DECIMAL(15, 2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wallets_user_type` (`user_id`, `wallet_type`),
  KEY `idx_wallets_user_id` (`user_id`),
  KEY `idx_wallets_wallet_type` (`wallet_type`),
  
  CONSTRAINT `fk_wallets_user` FOREIGN KEY (`user_id`) 
    REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_wallets_balance` CHECK (`balance` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. WALLET TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE `wallet_transactions` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `wallet_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL COMMENT 'Positive for credit, negative for debit',
  `transaction_type` VARCHAR(50) NOT NULL COMMENT 'transfer_in, transfer_out, cash_out, referral_commission, task_reward, etc.',
  `description` VARCHAR(500) DEFAULT NULL,
  `reference_id` CHAR(36) DEFAULT NULL COMMENT 'Optional link to related transaction',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_wallet_transactions_wallet_id` (`wallet_id`),
  KEY `idx_wallet_transactions_user_id` (`user_id`),
  KEY `idx_wallet_transactions_type` (`transaction_type`),
  KEY `idx_wallet_transactions_created_at` (`created_at`),
  
  CONSTRAINT `fk_wallet_transactions_wallet` FOREIGN KEY (`wallet_id`) 
    REFERENCES `wallets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. MEMBERSHIP PAYMENTS TABLE
-- ============================================================================

CREATE TABLE `membership_payments` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` CHAR(36) NOT NULL,
  `tier` ENUM('basic', 'pro', 'elite') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL COMMENT 'gcash, paymaya, bank_transfer, etc.',
  `reference_number` VARCHAR(100) DEFAULT NULL,
  `proof_url` VARCHAR(500) DEFAULT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `rejection_reason` TEXT DEFAULT NULL,
  `reviewed_by` CHAR(36) DEFAULT NULL,
  `reviewed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_membership_payments_user_id` (`user_id`),
  KEY `idx_membership_payments_status` (`status`),
  KEY `idx_membership_payments_created_at` (`created_at`),
  
  CONSTRAINT `fk_membership_payments_user` FOREIGN KEY (`user_id`) 
    REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. REFERRAL COMMISSIONS TABLE
-- ============================================================================

CREATE TABLE `referral_commissions` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `referrer_id` CHAR(36) NOT NULL COMMENT 'User who referred (receives commission)',
  `referred_id` CHAR(36) NOT NULL COMMENT 'User who was referred',
  `membership_tier` ENUM('basic', 'pro', 'elite') NOT NULL,
  `membership_amount` DECIMAL(12, 2) NOT NULL,
  `commission_rate` DECIMAL(5, 2) DEFAULT 40.00 COMMENT 'Percentage rate',
  `commission_amount` DECIMAL(12, 2) NOT NULL,
  `is_paid` TINYINT(1) DEFAULT 0,
  `paid_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_referral_commissions` (`referrer_id`, `referred_id`, `membership_tier`),
  KEY `idx_referral_commissions_referrer` (`referrer_id`),
  KEY `idx_referral_commissions_referred` (`referred_id`),
  KEY `idx_referral_commissions_is_paid` (`is_paid`),
  
  CONSTRAINT `fk_referral_commissions_referrer` FOREIGN KEY (`referrer_id`) 
    REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_referral_commissions_referred` FOREIGN KEY (`referred_id`) 
    REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. TASKS TABLE (VPA Daily Missions)
-- ============================================================================

CREATE TABLE `tasks` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `reward` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `category` VARCHAR(50) NOT NULL DEFAULT 'Social Media',
  `required_level` VARCHAR(20) NOT NULL DEFAULT 'cadet' COMMENT 'cadet, specialist, operative, vanguard, elite_operator',
  `proof_type` VARCHAR(20) NOT NULL DEFAULT 'screenshot' COMMENT 'screenshot, video, link',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_tasks_category` (`category`),
  KEY `idx_tasks_required_level` (`required_level`),
  KEY `idx_tasks_is_active` (`is_active`),
  KEY `idx_tasks_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. TASK SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE `task_submissions` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `task_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `proof_url` VARCHAR(500) DEFAULT NULL,
  `proof_type` VARCHAR(20) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `rejection_reason` TEXT DEFAULT NULL,
  `reward_amount` DECIMAL(10, 2) DEFAULT NULL,
  `reviewed_by` CHAR(36) DEFAULT NULL,
  `reviewed_at` TIMESTAMP NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_submissions_user_task` (`user_id`, `task_id`) COMMENT 'One submission per task per user',
  KEY `idx_task_submissions_task_id` (`task_id`),
  KEY `idx_task_submissions_user_id` (`user_id`),
  KEY `idx_task_submissions_status` (`status`),
  KEY `idx_task_submissions_submitted_at` (`submitted_at`),
  
  CONSTRAINT `fk_task_submissions_task` FOREIGN KEY (`task_id`) 
    REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_task_submissions_user` FOREIGN KEY (`user_id`) 
    REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. LOANS TABLE (ALPHA P2P Credits)
-- ============================================================================

CREATE TABLE `loans` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `lender_id` CHAR(36) NOT NULL,
  `borrower_id` CHAR(36) DEFAULT NULL,
  `principal_amount` DECIMAL(12, 2) NOT NULL,
  `interest_rate` DECIMAL(5, 2) NOT NULL DEFAULT 3.00 COMMENT 'Percentage',
  `interest_amount` DECIMAL(12, 2) DEFAULT NULL,
  `processing_fee` DECIMAL(12, 2) DEFAULT NULL,
  `total_repayment` DECIMAL(12, 2) DEFAULT NULL,
  `term_days` INT NOT NULL DEFAULT 7,
  `status` ENUM('pending', 'active', 'repaid', 'defaulted', 'cancelled') DEFAULT 'pending',
  `escrow_wallet_id` CHAR(36) DEFAULT NULL,
  `accepted_at` TIMESTAMP NULL,
  `due_at` TIMESTAMP NULL,
  `repaid_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_loans_lender_id` (`lender_id`),
  KEY `idx_loans_borrower_id` (`borrower_id`),
  KEY `idx_loans_status` (`status`),
  KEY `idx_loans_created_at` (`created_at`),
  
  CONSTRAINT `fk_loans_lender` FOREIGN KEY (`lender_id`) 
    REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_loans_borrower` FOREIGN KEY (`borrower_id`) 
    REFERENCES `profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_loans_escrow_wallet` FOREIGN KEY (`escrow_wallet_id`) 
    REFERENCES `wallets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_loans_principal` CHECK (`principal_amount` > 0),
  CONSTRAINT `chk_loans_interest_rate` CHECK (`interest_rate` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. LOAN TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE `loan_transactions` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `loan_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `from_wallet_id` CHAR(36) DEFAULT NULL,
  `to_wallet_id` CHAR(36) DEFAULT NULL,
  `transaction_type` VARCHAR(50) NOT NULL COMMENT 'escrow_deposit, disbursement, repayment, refund',
  `description` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_loan_transactions_loan_id` (`loan_id`),
  KEY `idx_loan_transactions_user_id` (`user_id`),
  KEY `idx_loan_transactions_type` (`transaction_type`),
  KEY `idx_loan_transactions_created_at` (`created_at`),
  
  CONSTRAINT `fk_loan_transactions_loan` FOREIGN KEY (`loan_id`) 
    REFERENCES `loans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_loan_transactions_from_wallet` FOREIGN KEY (`from_wallet_id`) 
    REFERENCES `wallets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_loan_transactions_to_wallet` FOREIGN KEY (`to_wallet_id`) 
    REFERENCES `wallets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. STORED PROCEDURES
-- ============================================================================

DELIMITER //

-- Generate unique referral code
CREATE FUNCTION `generate_referral_code`() RETURNS VARCHAR(8)
DETERMINISTIC
BEGIN
  DECLARE chars VARCHAR(36) DEFAULT 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  DECLARE result VARCHAR(8) DEFAULT '';
  DECLARE i INT DEFAULT 0;
  
  WHILE i < 8 DO
    SET result = CONCAT(result, SUBSTRING(chars, FLOOR(1 + RAND() * 36), 1));
    SET i = i + 1;
  END WHILE;
  
  RETURN result;
END //

-- Transfer between wallets
CREATE PROCEDURE `transfer_with_lock`(
  IN p_user_id CHAR(36),
  IN p_from_type VARCHAR(10),
  IN p_to_type VARCHAR(10),
  IN p_amount DECIMAL(15, 2)
)
BEGIN
  DECLARE v_from_wallet_id CHAR(36);
  DECLARE v_to_wallet_id CHAR(36);
  DECLARE v_from_balance DECIMAL(15, 2);
  
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SELECT JSON_OBJECT('success', FALSE, 'error', 'Transaction failed') AS result;
  END;
  
  IF p_amount <= 0 THEN
    SELECT JSON_OBJECT('success', FALSE, 'error', 'Amount must be positive') AS result;
  ELSEIF p_from_type = p_to_type THEN
    SELECT JSON_OBJECT('success', FALSE, 'error', 'Cannot transfer to the same wallet') AS result;
  ELSE
    START TRANSACTION;
    
    -- Lock and get source wallet
    SELECT id, balance INTO v_from_wallet_id, v_from_balance
    FROM wallets
    WHERE user_id = p_user_id AND wallet_type = p_from_type
    FOR UPDATE;
    
    IF v_from_wallet_id IS NULL THEN
      ROLLBACK;
      SELECT JSON_OBJECT('success', FALSE, 'error', 'Source wallet not found') AS result;
    ELSEIF v_from_balance < p_amount THEN
      ROLLBACK;
      SELECT JSON_OBJECT('success', FALSE, 'error', 'Insufficient balance') AS result;
    ELSE
      -- Lock destination wallet
      SELECT id INTO v_to_wallet_id
      FROM wallets
      WHERE user_id = p_user_id AND wallet_type = p_to_type
      FOR UPDATE;
      
      IF v_to_wallet_id IS NULL THEN
        ROLLBACK;
        SELECT JSON_OBJECT('success', FALSE, 'error', 'Destination wallet not found') AS result;
      ELSE
        -- Update balances
        UPDATE wallets SET balance = balance - p_amount WHERE id = v_from_wallet_id;
        UPDATE wallets SET balance = balance + p_amount WHERE id = v_to_wallet_id;
        
        -- Create transaction logs
        INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description)
        VALUES (v_from_wallet_id, p_user_id, -p_amount, 'transfer_out', CONCAT('Transfer to ', p_to_type, ' wallet'));
        
        INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description)
        VALUES (v_to_wallet_id, p_user_id, p_amount, 'transfer_in', CONCAT('Transfer from ', p_from_type, ' wallet'));
        
        COMMIT;
        
        SELECT JSON_OBJECT(
          'success', TRUE,
          'from_balance', (v_from_balance - p_amount),
          'amount', p_amount
        ) AS result;
      END IF;
    END IF;
  END IF;
END //

-- Approve task proof and credit wallet
CREATE PROCEDURE `approve_task_proof`(
  IN p_submission_id CHAR(36),
  IN p_reviewer_id CHAR(36)
)
BEGIN
  DECLARE v_user_id CHAR(36);
  DECLARE v_reward DECIMAL(10, 2);
  DECLARE v_task_wallet_id CHAR(36);
  DECLARE v_upline_id CHAR(36);
  DECLARE v_upline_tier VARCHAR(10);
  DECLARE v_royalty_amount DECIMAL(10, 2);
  DECLARE v_upline_royalty_wallet_id CHAR(36);
  
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SELECT JSON_OBJECT('success', FALSE, 'error', 'Approval failed') AS result;
  END;
  
  START TRANSACTION;
  
  -- Get submission details
  SELECT ts.user_id, t.reward INTO v_user_id, v_reward
  FROM task_submissions ts
  JOIN tasks t ON ts.task_id = t.id
  WHERE ts.id = p_submission_id AND ts.status = 'pending'
  FOR UPDATE;
  
  IF v_user_id IS NULL THEN
    ROLLBACK;
    SELECT JSON_OBJECT('success', FALSE, 'error', 'Submission not found or not pending') AS result;
  ELSE
    -- Update submission status
    UPDATE task_submissions 
    SET status = 'approved', reward_amount = v_reward, reviewed_by = p_reviewer_id, reviewed_at = NOW()
    WHERE id = p_submission_id;
    
    -- Get user's task wallet
    SELECT id INTO v_task_wallet_id
    FROM wallets
    WHERE user_id = v_user_id AND wallet_type = 'task'
    FOR UPDATE;
    
    -- Credit task wallet
    UPDATE wallets SET balance = balance + v_reward WHERE id = v_task_wallet_id;
    
    -- Log transaction
    INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
    VALUES (v_task_wallet_id, v_user_id, v_reward, 'task_reward', 'Task completion reward', p_submission_id);
    
    -- Check for 8% royalty override (Elite upline)
    SELECT p.referred_by, up.membership_tier INTO v_upline_id, v_upline_tier
    FROM profiles p
    LEFT JOIN profiles up ON p.referred_by = up.id
    WHERE p.id = v_user_id;
    
    IF v_upline_tier = 'elite' AND v_upline_id IS NOT NULL THEN
      SET v_royalty_amount = v_reward * 0.08;
      
      SELECT id INTO v_upline_royalty_wallet_id
      FROM wallets
      WHERE user_id = v_upline_id AND wallet_type = 'royalty'
      FOR UPDATE;
      
      IF v_upline_royalty_wallet_id IS NOT NULL THEN
        UPDATE wallets SET balance = balance + v_royalty_amount WHERE id = v_upline_royalty_wallet_id;
        
        INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
        VALUES (v_upline_royalty_wallet_id, v_upline_id, v_royalty_amount, 'royalty_override', 
                '8% Team Override from task completion', p_submission_id);
      END IF;
    END IF;
    
    COMMIT;
    SELECT JSON_OBJECT('success', TRUE, 'reward', v_reward) AS result;
  END IF;
END //

DELIMITER ;

-- ============================================================================
-- 15. TRIGGERS
-- ============================================================================

-- Auto-create 3 wallets for new user
DELIMITER //
CREATE TRIGGER `trg_profiles_after_insert` 
AFTER INSERT ON `profiles`
FOR EACH ROW
BEGIN
  INSERT INTO wallets (user_id, wallet_type, balance) VALUES (NEW.id, 'task', 0);
  INSERT INTO wallets (user_id, wallet_type, balance) VALUES (NEW.id, 'royalty', 0);
  INSERT INTO wallets (user_id, wallet_type, balance) VALUES (NEW.id, 'main', 0);
  
  -- Assign default member role
  INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'member');
END //
DELIMITER ;

-- Auto-calculate loan amounts on insert
DELIMITER //
CREATE TRIGGER `trg_loans_before_insert`
BEFORE INSERT ON `loans`
FOR EACH ROW
BEGIN
  SET NEW.interest_amount = NEW.principal_amount * (NEW.interest_rate / 100);
  SET NEW.processing_fee = NEW.principal_amount * 0.02; -- 2% processing fee
  SET NEW.total_repayment = NEW.principal_amount + NEW.interest_amount;
END //
DELIMITER ;

-- ============================================================================
-- 16. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_profiles_tier_kyc ON profiles (membership_tier, is_kyc_verified);
CREATE INDEX idx_wallets_balance ON wallets (balance);
CREATE INDEX idx_loans_status_due ON loans (status, due_at);
CREATE INDEX idx_task_submissions_status_submitted ON task_submissions (status, submitted_at);

-- ============================================================================
-- 17. SEED DATA (DEFAULT ADMIN)
-- ============================================================================

-- Create default admin (password: Admin@123 - CHANGE IN PRODUCTION!)
-- Use PHP: password_hash('Admin@123', PASSWORD_DEFAULT)
INSERT INTO `admins` (`id`, `username`, `password_hash`, `email`, `is_active`) VALUES
(UUID(), 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@amabilia.com', 1);

-- ============================================================================
-- 18. SAMPLE TASKS
-- ============================================================================

INSERT INTO `tasks` (`id`, `title`, `description`, `reward`, `category`, `required_level`, `proof_type`, `is_active`) VALUES
(UUID(), 'Facebook Page Like & Follow', 'Like and follow the official AMABILIA Facebook page and take a screenshot.', 25.00, 'Social Media', 'cadet', 'screenshot', 1),
(UUID(), 'YouTube Video Watch & Comment', 'Watch the full promotional video and leave a meaningful comment.', 50.00, 'Video Engagement', 'cadet', 'screenshot', 1),
(UUID(), 'TikTok Video Creation', 'Create a 30-second promotional TikTok video about AMABILIA.', 150.00, 'Content Creation', 'specialist', 'video', 1),
(UUID(), 'Blog Review Article', 'Write a 500-word blog post reviewing the AMABILIA platform.', 300.00, 'Content Writing', 'operative', 'link', 1),
(UUID(), 'Influencer Outreach', 'Contact and onboard a micro-influencer to join AMABILIA.', 500.00, 'Networking', 'vanguard', 'screenshot', 1),
(UUID(), 'Strategic Partnership', 'Establish a partnership with a local business for AMABILIA promotion.', 1000.00, 'Business Development', 'elite_operator', 'screenshot', 1);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
