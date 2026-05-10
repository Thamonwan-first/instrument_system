<?php
// api/staff/update_room.php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/Instrument.php';

header('Content-Type: application/json');

$id = $_POST['id'] ?? null;
$building_id = $_POST['building_id'] ?? null;
$room_number = $_POST['room_number'] ?? null;
$name = $_POST['name'] ?? null;
$floor = $_POST['floor'] ?? null;
$description = $_POST['description'] ?? null;

if (!$id || !$building_id || !$room_number) {
    http_response_code(400);
    echo json_encode(["error" => "Room ID, building ID, and room number required"]);
    exit;
}

$instrumentModel = new Instrument($conn);
if ($instrumentModel->updateRoom($id, $building_id, $room_number, $name, $floor, $description)) {
    echo json_encode(["message" => "Room updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update room"]);
}
?>
