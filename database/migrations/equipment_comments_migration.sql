-- Add equipment comments table for ratings and reviews
CREATE TABLE IF NOT EXISTS `equipment_comments` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `equipment_id`    INT UNSIGNED NOT NULL,
  `user_id`         INT UNSIGNED NOT NULL,
  `rating`          TINYINT UNSIGNED NOT NULL DEFAULT 5, -- 1-5 stars
  `comment`         TEXT DEFAULT NULL,
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_equipment` (`user_id`, `equipment_id`),
  KEY `idx_equipment` (`equipment_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_ec_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ec_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
