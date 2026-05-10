-- ============================================================
--  Lab Equipment Management System
--  Database Schema — MySQL (XAMPP)
--  Encoding: UTF-8 | Engine: InnoDB
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db`;


-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE `roles` (
  `id`          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(50)      NOT NULL UNIQUE,  -- student, staff, admin, ceo
  `created_at`  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `name`) VALUES
  (1, 'admin'),
  (2, 'staff'),
  (3, 'student'),
  (4, 'ceo');


-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE `users` (
  `id`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `role_id`         TINYINT UNSIGNED NOT NULL DEFAULT 3,       -- default = student
  `username`        VARCHAR(50)      NOT NULL UNIQUE,
  `student_id`      VARCHAR(20)      DEFAULT NULL UNIQUE,      -- รหัสนักศึกษา (NULL สำหรับ staff/admin)
  `prefix`          VARCHAR(10)      DEFAULT NULL,             -- นาย / นาง / นางสาว / ดร.
  `first_name`      VARCHAR(100)     NOT NULL,
  `last_name`       VARCHAR(100)     NOT NULL,
  `email`           VARCHAR(150)     NOT NULL UNIQUE,
  `phone`           VARCHAR(20)      DEFAULT NULL,
  `password_hash`   VARCHAR(255)     NOT NULL,
  `department`      VARCHAR(150)     DEFAULT NULL,             -- สาขาวิชา / ภาควิชา
  `faculty`         VARCHAR(150)     DEFAULT NULL,
  `avatar`          VARCHAR(255)     DEFAULT NULL,             -- path to image
  `is_active`       TINYINT(1)       NOT NULL DEFAULT 1,
  `email_verified`  TINYINT(1)       NOT NULL DEFAULT 0,
  `last_login`      TIMESTAMP        NULL,
  `created_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_role` (`role_id`),
  KEY `idx_email` (`email`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. PERMISSIONS (Granular feature flags)
-- ============================================================
CREATE TABLE `permissions` (
  `id`          SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100)      NOT NULL UNIQUE,
  `description` VARCHAR(255)      DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_id`       TINYINT UNSIGNED  NOT NULL,
  `permission_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role`       FOREIGN KEY (`role_id`)       REFERENCES `roles`(`id`)       ON DELETE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `permissions` (`name`, `description`) VALUES
  ('equipment.view',      'ดูรายการเครื่องมือ'),
  ('equipment.create',    'เพิ่มเครื่องมือ'),
  ('equipment.edit',      'แก้ไขเครื่องมือ'),
  ('equipment.delete',    'ลบเครื่องมือ'),
  ('booking.create',      'สร้างการจอง'),
  ('booking.approve',     'อนุมัติการจอง'),
  ('repair.create',       'แจ้งซ่อม'),
  ('repair.manage',       'จัดการคำขอซ่อม'),
  ('usage.log',           'บันทึกการใช้งาน (QR)'),
  ('user.manage',         'จัดการ User');


-- ============================================================
-- 4. BUILDINGS
-- ============================================================
CREATE TABLE `buildings` (
  `id`          SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code`        VARCHAR(20)       DEFAULT NULL,
  `name`        VARCHAR(150)      NOT NULL,
  `description` TEXT              DEFAULT NULL,
  `image`       VARCHAR(255)      DEFAULT NULL,
  `is_active`   TINYINT(1)        NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. ROOMS
-- ============================================================
CREATE TABLE `rooms` (
  `id`           SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `building_id`  SMALLINT UNSIGNED NOT NULL,
  `room_number`  VARCHAR(30)       NOT NULL,
  `name`         VARCHAR(150)      DEFAULT NULL,
  `floor`        TINYINT           DEFAULT NULL,
  `description`  TEXT              DEFAULT NULL,
  `is_active`    TINYINT(1)        NOT NULL DEFAULT 1,
  `created_at`   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room` (`building_id`, `room_number`),
  CONSTRAINT `fk_rooms_building` FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 6. EQUIPMENT CATEGORIES
-- ============================================================
CREATE TABLE `equipment_categories` (
  `id`          SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100)      NOT NULL,
  `description` VARCHAR(255)      DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 7. EQUIPMENT
-- ============================================================
CREATE TABLE `equipment` (
  `id`              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `room_id`         SMALLINT UNSIGNED NOT NULL,
  `category_id`     SMALLINT UNSIGNED DEFAULT NULL,
  `code`            VARCHAR(50)       NOT NULL UNIQUE,
  `name`            VARCHAR(200)      NOT NULL,
  `brand`           VARCHAR(100)      DEFAULT NULL,
  `model`           VARCHAR(100)      DEFAULT NULL,
  `serial_number`   VARCHAR(100)      DEFAULT NULL UNIQUE,
  `purchase_price`  DECIMAL(12,2)     DEFAULT NULL,
  `status`          ENUM('available','in_use','maintenance','retired') NOT NULL DEFAULT 'available',
  `description`     TEXT              DEFAULT NULL,
  `usage_rules`     TEXT              DEFAULT NULL,
  `qr_token`        VARCHAR(100)      NOT NULL UNIQUE,
  `thumbnail`       VARCHAR(255)      DEFAULT NULL,
  `is_bookable`     TINYINT(1)        NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_eq_room`     FOREIGN KEY (`room_id`)     REFERENCES `rooms`(`id`),
  CONSTRAINT `fk_eq_category` FOREIGN KEY (`category_id`) REFERENCES `equipment_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 8. BOOKINGS
-- ============================================================
CREATE TABLE `bookings` (
  `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `equipment_id` INT UNSIGNED  NOT NULL,
  `user_id`      INT UNSIGNED  NOT NULL,
  `start_time`   DATETIME      NOT NULL,
  `end_time`     DATETIME      NOT NULL,
  `status`       ENUM('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
  `created_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_bk_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`),
  CONSTRAINT `fk_bk_user`      FOREIGN KEY (`user_id`)      REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 9. USAGE LOGS
-- ============================================================
CREATE TABLE `usage_logs` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `equipment_id`  INT UNSIGNED    NOT NULL,
  `user_id`       INT UNSIGNED    NOT NULL,
  `check_in`      DATETIME        NOT NULL,
  `check_out`     DATETIME        DEFAULT NULL,
  `duration_min`  SMALLINT UNSIGNED DEFAULT NULL,
  `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ul_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`),
  CONSTRAINT `fk_ul_user`      FOREIGN KEY (`user_id`)      REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 10. REPAIR REPORTS
-- ============================================================
CREATE TABLE `repair_reports` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `equipment_id`    INT UNSIGNED  NOT NULL,
  `reported_by`     INT UNSIGNED  NOT NULL,
  `title`           VARCHAR(200)  NOT NULL,
  `description`     TEXT          NOT NULL,
  `severity`        ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `status`          ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rr_equipment`  FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`),
  CONSTRAINT `fk_rr_reporter`   FOREIGN KEY (`reported_by`)  REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `repair_images` (
  `id`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` INT UNSIGNED NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ri_report` FOREIGN KEY (`report_id`) REFERENCES `repair_reports`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 11. SPARE PARTS
-- ============================================================
CREATE TABLE `spare_parts` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(150) NOT NULL,
  `description` TEXT,
  `quantity`    INT NOT NULL DEFAULT 0,
  `unit`        VARCHAR(20) DEFAULT 'ชิ้น',
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `spare_part_usage` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `repair_id`     INT UNSIGNED NOT NULL,
  `spare_part_id` INT UNSIGNED NOT NULL,
  `quantity`      INT NOT NULL,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_spu_repair` FOREIGN KEY (`repair_id`) REFERENCES `repair_reports`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_spu_part`   FOREIGN KEY (`spare_part_id`) REFERENCES `spare_parts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 12. NOTIFICATIONS
-- ============================================================
CREATE TABLE `notifications` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED NOT NULL,
  `title`       VARCHAR(200) NOT NULL,
  `message`     TEXT NOT NULL,
  `type`        VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
  `is_read`     TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- USEFUL VIEWS
-- ============================================================

CREATE OR REPLACE VIEW `v_equipment_full` AS
SELECT
  e.id, e.code, e.name, e.brand, e.model, e.status, e.purchase_price, e.qr_token, e.thumbnail, e.is_bookable,
  r.id AS room_id, r.room_number, r.name AS room_name,
  b.id AS building_id, b.name AS building_name
FROM equipment e
JOIN rooms r ON e.room_id = r.id
JOIN buildings b ON r.building_id = b.id;

CREATE OR REPLACE VIEW `v_usage_stats_daily` AS
SELECT
  user_id, DATE(check_in) AS usage_date, COUNT(*) AS session_count
FROM usage_logs
GROUP BY user_id, DATE(check_in);

CREATE OR REPLACE VIEW `v_open_repairs` AS
SELECT
  rr.*, e.name AS instrument_name, u.first_name, u.last_name
FROM repair_reports rr
JOIN equipment e ON rr.equipment_id = e.id
JOIN users u ON rr.reported_by = u.id
WHERE rr.status IN ('open', 'in_progress');


-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER $$

CREATE PROCEDURE `sp_checkin` (
  IN  p_qr_token   VARCHAR(100),
  IN  p_user_id    INT UNSIGNED,
  OUT p_log_id     BIGINT UNSIGNED,
  OUT p_msg        VARCHAR(200)
)
BEGIN
  DECLARE v_eq_id INT UNSIGNED;
  DECLARE v_status VARCHAR(20);

  SELECT id, status INTO v_eq_id, v_status FROM equipment WHERE qr_token = p_qr_token LIMIT 1;

  IF v_eq_id IS NULL THEN
    SET p_msg = 'QR Code ไม่ถูกต้อง';
    SET p_log_id = 0;
  ELSEIF v_status = 'maintenance' THEN
    SET p_msg = 'เครื่องอยู่ระหว่างซ่อมบำรุง';
    SET p_log_id = 0;
  ELSE
    INSERT INTO usage_logs (equipment_id, user_id, check_in) VALUES (v_eq_id, p_user_id, NOW());
    SET p_log_id = LAST_INSERT_ID();
    SET p_msg = 'Check-in สำเร็จ';
    UPDATE equipment SET status = 'in_use' WHERE id = v_eq_id;
  END IF;
END$$

CREATE PROCEDURE `sp_checkout` (
  IN  p_log_id   BIGINT UNSIGNED,
  OUT p_duration SMALLINT UNSIGNED,
  OUT p_msg      VARCHAR(200)
)
BEGIN
  DECLARE v_eq_id INT UNSIGNED;
  DECLARE v_check_in DATETIME;

  SELECT equipment_id, check_in INTO v_eq_id, v_check_in FROM usage_logs WHERE id = p_log_id AND check_out IS NULL LIMIT 1;

  IF v_eq_id IS NULL THEN
    SET p_msg = 'ไม่พบ session หรือ Check-out แล้ว';
    SET p_duration = 0;
  ELSE
    SET p_duration = TIMESTAMPDIFF(MINUTE, v_check_in, NOW());
    UPDATE usage_logs SET check_out = NOW(), duration_min = p_duration WHERE id = p_log_id;
    UPDATE equipment SET status = 'available' WHERE id = v_eq_id;
    SET p_msg = CONCAT('Check-out สำเร็จ ใช้งาน ', p_duration, ' นาที');
  END IF;
END$$

DELIMITER ;

-- ============================================================
-- INITIAL ADMIN (Username: admin, Password: password)
-- ============================================================
INSERT IGNORE INTO `users` (`role_id`, `username`, `first_name`, `last_name`, `email`, `password_hash`) VALUES
(1, 'admin', 'System', 'Admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

SET FOREIGN_KEY_CHECKS = 1;
