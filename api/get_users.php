<?php
// api/get_users.php
include 'config.php';

header("Content-Type: application/json");

// ตรวจสอบสิทธิ์ (ในระบบจริงควรใช้ Session หรือ JWT)
// ในที่นี้เราสมมติว่ามีการกรองข้อมูลเบื้องต้น

$query = "SELECT id, username, first_name, last_name, student_id, phone, email, role, created_at FROM users ORDER BY role, first_name";
$stmt = $conn->prepare($query);
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($users);
?>