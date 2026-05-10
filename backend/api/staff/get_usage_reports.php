<?php
// api/staff/get_usage_reports.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$type = $_GET['type'] ?? 'logs'; // logs, stats, active
$user_id = $_GET['user_id'] ?? null;

if ($type === 'logs') {
    $query = "SELECT l.*, e.name as instrument_name, u.first_name, u.last_name, u.student_id 
              FROM usage_logs l
              JOIN equipment e ON l.equipment_id = e.id
              JOIN users u ON l.user_id = u.id";
    $params = [];
    if ($user_id) {
        $query .= " WHERE l.user_id = ?";
        $params[] = $user_id;
    }
    $query .= " ORDER BY l.check_in DESC LIMIT 100";
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else if ($type === 'active') {
    $query = "SELECT l.*, e.name as instrument_name, b.name as building_name, r.name as room_number 
              FROM usage_logs l
              JOIN equipment e ON l.equipment_id = e.id
              JOIN rooms r ON e.room_id = r.id
              JOIN buildings b ON r.building_id = b.id
              WHERE l.check_out IS NULL";
    $params = [];
    if ($user_id) {
        $query .= " AND l.user_id = ?";
        $params[] = $user_id;
    }
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else if ($type === 'stats') {
    // Usage frequency per instrument
    $query = "SELECT e.name, COUNT(l.id) as usage_count, SUM(l.duration_min) as total_duration
              FROM equipment e
              LEFT JOIN usage_logs l ON e.id = l.equipment_id
              GROUP BY e.id
              ORDER BY usage_count DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>
