<?php
// api/staff/get_bookings.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$status = $_GET['status'] ?? 'pending';

$query = "SELECT b.*, e.name as instrument_name, u.first_name, u.last_name, u.student_id 
          FROM bookings b
          JOIN equipment e ON b.equipment_id = e.id
          JOIN users u ON b.user_id = u.id
          WHERE b.status = ?
          ORDER BY b.created_at DESC";

$stmt = $conn->prepare($query);
$stmt->execute([$status]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
