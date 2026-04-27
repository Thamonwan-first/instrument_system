-- Mock Data for Instrument System
USE `instrument_usage`;

-- Clear existing data using DELETE to avoid Foreign Key issues
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM `maintenance`;
DELETE FROM `bookings`;
DELETE FROM `usage_logs`;
DELETE FROM `instruments`;
DELETE FROM `rooms`;
DELETE FROM `buildings`;
DELETE FROM `users`;

-- Reset Auto Increment (Optional)
ALTER TABLE `maintenance` AUTO_INCREMENT = 1;
ALTER TABLE `bookings` AUTO_INCREMENT = 1;
ALTER TABLE `usage_logs` AUTO_INCREMENT = 1;
ALTER TABLE `instruments` AUTO_INCREMENT = 1;
ALTER TABLE `rooms` AUTO_INCREMENT = 1;
ALTER TABLE `buildings` AUTO_INCREMENT = 1;
ALTER TABLE `users` AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users with different roles
-- Password is 'password' for all ($2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
INSERT INTO `users` (`username`, `password`, `first_name`, `last_name`, `student_id`, `phone`, `email`, `role`) VALUES
('admin01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Somsak', 'Admin', NULL, '0812345678', 'admin@univ.ac.th', 'admin'),
('staff01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Wichai', 'Toolkeeper', NULL, '0823456789', 'staff01@univ.ac.th', 'staff'),
('student01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Somchai', 'Learning', '64010123', '0834567890', 'somchai@mail.com', 'student'),
('ceo01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Prasert', 'Director', NULL, '0845678901', 'director@univ.ac.th', 'ceo');

-- 2. Buildings
INSERT INTO `buildings` (`id`, `name`) VALUES
(1, 'Building A - Science Center'),
(2, 'Building B - Engineering Lab');

-- 3. Rooms
INSERT INTO `rooms` (`id`, `building_id`, `name`) VALUES
(1, 1, 'Physics Lab 101'),
(2, 1, 'Chemistry Lab 202'),
(3, 2, 'Mechanical Workshop'),
(4, 2, 'Electronics Lab');

-- 4. Instruments
INSERT INTO `instruments` (`id`, `room_id`, `name`, `description`, `price`, `status`, `rules`) VALUES
(1, 1, 'Digital Oscilloscope', 'Tektronix 200MHz 4 Channel', 45000.00, 'active', 'Handle with care, do not exceed voltage limits.'),
(2, 1, 'Laser Source', 'He-Ne Gas Laser 5mW', 12000.00, 'active', 'Wear safety goggles at all times.'),
(3, 2, 'Gas Chromatograph', 'Agilent 7890B GC System', 1200000.00, 'maintenance', 'Restricted to certified personnel only.'),
(4, 4, '3D Printer', 'Prusa i3 MK3S+', 35000.00, 'active', 'Check filament level before starting.');

-- 5. Usage Logs (Mock frequency for the graph)
INSERT INTO `usage_logs` (`user_id`, `instrument_id`, `check_in`, `check_out`, `feedback`) VALUES
(3, 1, '2026-04-20 09:00:00', '2026-04-20 11:00:00', 'Works perfectly'),
(3, 1, '2026-04-21 10:30:00', '2026-04-21 12:00:00', NULL),
(3, 4, '2026-04-22 13:00:00', '2026-04-22 17:00:00', 'Print finished successfully'),
(3, 1, '2026-04-25 09:00:00', '2026-04-25 10:00:00', NULL);

-- 6. Bookings
INSERT INTO `bookings` (`user_id`, `instrument_id`, `start_date`, `end_date`, `status`) VALUES
(3, 1, '2026-04-28 09:00:00', '2026-04-28 12:00:00', 'approved'),
(3, 2, '2026-04-29 13:00:00', '2026-04-29 15:00:00', 'pending');
