<?php
// api/staff/get_rooms.php
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$building_id = $_GET['building_id'] ?? null;

if (!$building_id) {
    http_response_code(400);
    echo json_encode(["error" => "Building ID required"]);
    exit;
}

$query = "SELECT id, room_number, name FROM rooms WHERE building_id = ? AND is_active = 1 ORDER BY room_number";
$stmt = $GLOBALS['conn']->prepare($query);
$stmt->execute([$building_id]);
$rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($rooms);
?>
