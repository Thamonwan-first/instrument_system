-- Add equipment_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS `equipment_status_history` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `equipment_id`    INT UNSIGNED NOT NULL,
  `old_status`      VARCHAR(50) DEFAULT NULL,
  `new_status`      VARCHAR(50) NOT NULL,
  `changed_by`      INT UNSIGNED DEFAULT NULL,
  `reason`          TEXT DEFAULT NULL,
  `notes`           TEXT DEFAULT NULL,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_equipment` (`equipment_id`),
  KEY `idx_date` (`created_at`),
  CONSTRAINT `fk_esh_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_esh_user` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
