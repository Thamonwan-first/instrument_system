-- ============================================================
-- Comprehensive Mock Data for Lab Equipment Management System
-- Password for all users: 1234
-- ============================================================

USE `db`;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM `repair_images`;
DELETE FROM `repair_reports`;
DELETE FROM `usage_logs`;
DELETE FROM `bookings`;
DELETE FROM `equipment`;
DELETE FROM `equipment_categories`;
DELETE FROM `rooms`;
DELETE FROM `buildings`;
DELETE FROM `users`;

ALTER TABLE `repair_images` AUTO_INCREMENT = 1;
ALTER TABLE `repair_reports` AUTO_INCREMENT = 1;
ALTER TABLE `usage_logs` AUTO_INCREMENT = 1;
ALTER TABLE `bookings` AUTO_INCREMENT = 1;
ALTER TABLE `equipment` AUTO_INCREMENT = 1;
ALTER TABLE `equipment_categories` AUTO_INCREMENT = 1;
ALTER TABLE `rooms` AUTO_INCREMENT = 1;
ALTER TABLE `buildings` AUTO_INCREMENT = 1;
ALTER TABLE `users` AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS (Password hash for '1234')
INSERT INTO `users` (`id`, `role_id`, `username`, `student_id`, `prefix`, `first_name`, `last_name`, `email`, `password_hash`, `department`, `faculty`) VALUES
(1, 1, 'admin', NULL, 'นาย', 'สมศักดิ์', 'ดูแลระบบ', 'admin@example.com', '$2y$10$X8f./Uw9PrFqyKdlEhTfeeBE2c2UeeVhUDZfk0/rkBKvOWDDh9n3G', 'IT Center', 'ศูนย์คอมพิวเตอร์'),
(2, 2, 'staff_somchai', NULL, 'นาย', 'สมชาย', 'รักชาติ', 'somchai.r@example.com', '$2y$10$X8f./Uw9PrFqyKdlEhTfeeBE2c2UeeVhUDZfk0/rkBKvOWDDh9n3G', 'Science Lab', 'คณะวิทยาศาสตร์'),
(3, 2, 'staff_wilai', NULL, 'นางสาว', 'วิไล', 'วรรณดี', 'wilai.w@example.com', '$2y$10$X8f./Uw9PrFqyKdlEhTfeeBE2c2UeeVhUDZfk0/rkBKvOWDDh9n3G', 'Engineering Lab', 'คณะวิศวกรรมศาสตร์'),
(4, 3, '640001', '640001', 'นาย', 'กิตติ', 'มีโชค', 'kitti.m@example.com', '$2y$10$X8f./Uw9PrFqyKdlEhTfeeBE2c2UeeVhUDZfk0/rkBKvOWDDh9n3G', 'Physics', 'คณะวิทยาศาสตร์'),
(5, 3, '640002', '640002', 'นางสาว', 'นารี', 'สวยสด', 'naree.s@example.com', '$2y$10$X8f./Uw9PrFqyKdlEhTfeeBE2c2UeeVhUDZfk0/rkBKvOWDDh9n3G', 'Chemistry', 'คณะวิทยาศาสตร์'),
(6, 3, '650001', '650001', 'นาย', 'ปัญญา', 'ประเสริฐ', 'panya.p@example.com', '$2y$10$X8f./Uw9PrFqyKdlEhTfeeBE2c2UeeVhUDZfk0/rkBKvOWDDh9n3G', 'Mechanical', 'คณะวิศวกรรมศาสตร์'),
(7, 3, '650002', '650002', 'นางสาว', 'รัตนา', 'เรืองรอง', 'rattana.r@example.com', '$2y$10$X8f./Uw9PrFqyKdlEhTfeeBE2c2UeeVhUDZfk0/rkBKvOWDDh9n3G', 'Electrical', 'คณะวิศวกรรมศาสตร์'),
(8, 4, 'ceo', NULL, 'ดร.', 'วีระ', 'พานิช', 'weera.p@example.com', '$2y$10$X8f./Uw9PrFqyKdlEhTfeeBE2c2UeeVhUDZfk0/rkBKvOWDDh9n3G', 'Executive', 'สำนักงานอธิการบดี'),
(9, 3, '660001', '660001', 'นาย', 'มานะ', 'อดทน', 'mana.o@example.com', '$2y$10$X8f./Uw9PrFqyKdlEhTfeeBE2c2UeeVhUDZfk0/rkBKvOWDDh9n3G', 'Physics', 'คณะวิทยาศาสตร์'),
(10, 3, '660002', '660002', 'นางสาว', 'ชูใจ', 'รักเรียน', 'choojai.r@example.com', '$2y$10$X8f./Uw9PrFqyKdlEhTfeeBE2c2UeeVhUDZfk0/rkBKvOWDDh9n3G', 'Chemistry', 'คณะวิทยาศาสตร์');

-- 2. BUILDINGS
INSERT INTO `buildings` (`id`, `code`, `name`, `description`) VALUES
(1, 'ENG1', 'อาคารวิศวกรรม 1', 'ตึกวิศวกรรมหลัก ฝั่งเหนือ'),
(2, 'SCI-A', 'อาคารวิทยาศาสตร์ A', 'ตึกเรียนรวมคณะวิทยาศาสตร์'),
(3, 'LIB-C', 'อาคารหอสมุดกลาง', 'ศูนย์วิจัยและเทคโนโลยีสารสนเทศ'),
(4, 'AGRI-1', 'อาคารเกษตรศาสตร์ 1', 'ห้องปฏิบัติการพืชสวนและสัตวบาล');

-- 3. ROOMS
INSERT INTO `rooms` (`id`, `building_id`, `room_number`, `name`, `floor`) VALUES
(1, 1, '101', 'ห้องปฏิบัติการไฟฟ้าพื้นฐาน', 1),
(2, 1, '205', 'ห้องเครื่องกลและหุ่นยนต์', 2),
(3, 2, 'LAB-3A', 'ห้องเคมีวิเคราะห์ 1', 3),
(4, 2, 'LAB-3B', 'ห้องเคมีอินทรีย์', 3),
(5, 3, '401', 'ห้องแล็บ AI และ Data Science', 4),
(6, 4, '102', 'ห้องปฏิบัติการพืชศาสตร์', 1),
(7, 1, '301', 'ห้องควบคุมระบบอัตโนมัติ', 3),
(8, 2, 'PHYS-2', 'ห้องปฏิบัติการฟิสิกส์ชั้นสูง', 2);

-- 4. EQUIPMENT CATEGORIES
INSERT INTO `equipment_categories` (`id`, `name`, `description`) VALUES
(1, 'เครื่องมือวัดไฟฟ้า', 'Digital Multimeter, Oscilloscope, Signal Generator'),
(2, 'เครื่องจักรกล', 'CNC, Lathe, Milling Machine'),
(3, 'อุปกรณ์วิเคราะห์เคมี', 'Spectrophotometer, GC-MS, pH Meter'),
(4, 'คอมพิวเตอร์ประสิทธิภาพสูง', 'Server, GPU Workstation'),
(5, 'เครื่องมือทางฟิสิกส์', 'Laser, Vacuum Chamber, Spectrometer'),
(6, 'อุปกรณ์เกษตรสมัยใหม่', 'Smart Sensor, Hydroponic System');

-- 5. EQUIPMENT
INSERT INTO `equipment` (`id`, `room_id`, `category_id`, `code`, `name`, `brand`, `model`, `purchase_price`, `status`, `qr_token`, `is_bookable`) VALUES
(1, 1, 1, 'ENG1-101-001', 'Digital Oscilloscope', 'Tektronix', 'TBS1052B', 25000.00, 'available', 'QR-OSC-001', 1),
(2, 1, 1, 'ENG1-101-002', 'Digital Multimeter', 'Fluke', '115', 8500.00, 'available', 'QR-MULTI-002', 1),
(3, 2, 2, 'ENG1-205-001', 'CNC Lathe Machine', 'Mazak', 'Quick Turn 200', 1500000.00, 'maintenance', 'QR-CNC-001', 0),
(4, 3, 3, 'SCI-A-3A-001', 'UV-Vis Spectrophotometer', 'Shimadzu', 'UV-1900i', 450000.00, 'available', 'QR-SPEC-001', 1),
(5, 5, 4, 'LIB-C-401-001', 'Deep Learning Server', 'NVIDIA', 'DGX Station A100', 4500000.00, 'in_use', 'QR-AI-001', 1),
(6, 4, 3, 'SCI-A-3B-001', 'Rotary Evaporator', 'Buchi', 'R-300', 320000.00, 'available', 'QR-ROT-001', 1),
(7, 8, 5, 'SCI-A-PHYS-001', 'Helium-Neon Laser', 'Thorlabs', 'HNL210L', 120000.00, 'available', 'QR-LAS-001', 1),
(8, 6, 6, 'AGRI-102-001', 'Smart Green House Kit', 'SmartFarm', 'SF-V3', 85000.00, 'available', 'QR-AGRI-001', 1),
(9, 1, 1, 'ENG1-101-003', 'DC Power Supply', 'Keysight', 'E36311A', 42000.00, 'available', 'QR-DC-001', 1),
(10, 7, 2, 'ENG1-301-001', 'Robotic Arm (6-Axis)', 'KUKA', 'KR 6 R900', 850000.00, 'available', 'QR-ROB-001', 1),
(11, 2, 2, 'ENG1-205-002', 'Vertical Milling Machine', 'Haas', 'VF-2', 2200000.00, 'available', 'QR-MILL-001', 1),
(12, 3, 3, 'SCI-A-3A-002', 'Analytical Balance', 'Mettler Toledo', 'MS204TS', 65000.00, 'available', 'QR-BAL-001', 1),
(13, 5, 4, 'LIB-C-401-002', 'Workstation RTX 4090', 'Dell', 'Precision 7960', 280000.00, 'available', 'QR-WS-001', 1),
(14, 8, 5, 'SCI-A-PHYS-002', 'Digital Microscope', 'Keyence', 'VHX-7000', 1800000.00, 'available', 'QR-MIC-001', 1),
(15, 4, 3, 'SCI-A-3B-002', 'Magnetic Stirrer', 'IKA', 'C-MAG HS 7', 12000.00, 'available', 'QR-STIR-001', 1),
(16, 6, 6, 'AGRI-102-002', 'Drone for Agriculture', 'DJI', 'Agras T30', 450000.00, 'maintenance', 'QR-DRONE-001', 0),
(17, 1, 1, 'ENG1-101-004', 'Function Generator', 'Rigol', 'DG1022Z', 15500.00, 'available', 'QR-FUNC-001', 1),
(18, 7, 2, 'ENG1-301-002', 'PLC Training Set', 'Siemens', 'S7-1200', 45000.00, 'available', 'QR-PLC-001', 1),
(19, 3, 3, 'SCI-A-3A-003', 'pH Meter Digital', 'Hanna', 'HI5221', 35000.00, 'available', 'QR-PH-001', 1),
(20, 5, 4, 'LIB-C-401-003', '3D Printer Industrial', 'Stratasys', 'F170', 650000.00, 'available', 'QR-3DP-001', 1);

-- 6. BOOKINGS
INSERT INTO `bookings` (`id`, `equipment_id`, `user_id`, `start_time`, `end_time`, `status`, `created_at`) VALUES
(1, 1, 4, '2026-05-05 09:00:00', '2026-05-05 12:00:00', 'completed', '2026-05-01 10:00:00'),
(2, 4, 5, '2026-05-10 13:00:00', '2026-05-10 16:00:00', 'approved', '2026-05-02 08:30:00'),
(3, 7, 9, '2026-05-12 10:00:00', '2026-05-12 14:00:00', 'pending', '2026-05-02 11:15:00'),
(4, 13, 6, '2026-05-03 09:00:00', '2026-05-03 17:00:00', 'pending', '2026-05-02 14:20:00'),
(5, 2, 7, '2026-05-06 08:00:00', '2026-05-06 10:00:00', 'approved', '2026-05-01 16:45:00'),
(6, 10, 3, '2026-05-15 13:00:00', '2026-05-15 16:00:00', 'approved', '2026-05-02 09:00:00'),
(7, 20, 4, '2026-05-20 09:00:00', '2026-05-21 16:00:00', 'pending', '2026-05-02 10:45:00'),
(8, 14, 10, '2026-05-08 13:00:00', '2026-05-08 15:00:00', 'rejected', '2026-05-01 13:00:00');

-- 7. USAGE LOGS
INSERT INTO `usage_logs` (`id`, `equipment_id`, `user_id`, `check_in`, `check_out`, `duration_min`) VALUES
(1, 1, 4, '2026-05-05 09:05:00', '2026-05-05 11:55:00', 170),
(2, 5, 6, '2026-05-02 08:00:00', NULL, NULL),
(3, 2, 7, '2026-04-28 10:00:00', '2026-04-28 11:30:00', 90),
(4, 12, 5, '2026-04-29 14:00:00', '2026-04-29 15:00:00', 60),
(5, 17, 4, '2026-05-01 13:00:00', '2026-05-01 15:45:00', 165);

-- 8. REPAIR REPORTS
INSERT INTO `repair_reports` (`id`, `equipment_id`, `reported_by`, `title`, `description`, `severity`, `status`, `created_at`) VALUES
(1, 3, 2, 'เครื่องมีเสียงดังผิดปกติ', 'พบเสียงกระแทกขณะเดินเครื่องในความเร็วสูง อาจมีปัญหาที่ลูกปืนหลัก', 'high', 'in_progress', '2026-04-25 10:30:00'),
(2, 16, 3, 'มอเตอร์ใบพัดไม่หมุน', 'เครื่องโดรนสตาร์ทไม่ติด และมีกลิ่นไหม้จากมอเตอร์ตัวที่ 3', 'critical', 'open', '2026-05-01 16:00:00'),
(3, 2, 4, 'หน้าจอแสดงผลจาง', 'ตัวเลขบนหน้าจอแสดงผลไม่ชัดเจน เมื่อใช้ไปสักพักจะดับ', 'low', 'resolved', '2026-04-20 09:00:00'),
(4, 9, 2, 'ฟิวส์ขาดบ่อย', 'เครื่อง Power Supply ตัดไฟเองบ่อยครั้งเมื่อจ่ายกระแสเกิน 1A', 'medium', 'open', '2026-05-02 11:00:00');

-- 9. REPAIR IMAGES (Mock paths)
INSERT INTO `repair_images` (`report_id`, `file_path`) VALUES
(1, 'uploads/repairs/cnc_bearing.jpg'),
(2, 'uploads/repairs/drone_motor.jpg'),
(4, 'uploads/repairs/psu_fuse.jpg');
