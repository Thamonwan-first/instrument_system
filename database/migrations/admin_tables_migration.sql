-- Add audit_logs table for system activity tracking
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED DEFAULT NULL,
  `action`          VARCHAR(100) NOT NULL, -- login, logout, create, update, delete, approve, etc
  `entity_type`     VARCHAR(50) DEFAULT NULL, -- user, equipment, building, booking, etc
  `entity_id`       INT UNSIGNED DEFAULT NULL,
  `old_value`       JSON DEFAULT NULL,
  `new_value`       JSON DEFAULT NULL,
  `ip_address`      VARCHAR(45) DEFAULT NULL,
  `user_agent`      VARCHAR(255) DEFAULT NULL,
  `description`     TEXT DEFAULT NULL,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_date` (`created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add staff_approvals table for new staff registration workflow
CREATE TABLE IF NOT EXISTS `staff_approvals` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED NOT NULL,
  `status`          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `requested_by`    INT UNSIGNED NOT NULL, -- the staff/admin who requested
  `approved_by`     INT UNSIGNED DEFAULT NULL, -- the admin who approved
  `rejection_reason` TEXT DEFAULT NULL,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `approved_at`     TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_sa_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sa_requested` FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sa_approved` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add user_suspensions table
CREATE TABLE IF NOT EXISTS `user_suspensions` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED NOT NULL,
  `suspended_by`    INT UNSIGNED NOT NULL,
  `reason`          TEXT DEFAULT NULL,
  `suspended_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `unsuspended_at`  TIMESTAMP NULL,
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_us_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_us_suspended_by` FOREIGN KEY (`suspended_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
