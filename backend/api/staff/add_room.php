<?php
// api/staff/add_room.php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/Instrument.php';

header('Content-Type: application/json');

$building_id = $_POST['building_id'] ?? null;
$room_number = $_POST['room_number'] ?? null;
$name = $_POST['name'] ?? null;
$floor = $_POST['floor'] ?? null;
$description = $_POST['description'] ?? null;

if (!$building_id || !$room_number) {
    http_response_code(400);
    echo json_encode(["error" => "Building ID and room number required"]);
    exit;
}

$instrumentModel = new Instrument($conn);
if ($instrumentModel->addRoom($building_id, $room_number, $name, $floor, $description)) {
    echo json_encode(["message" => "Room added successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to add room or duplicate room number"]);
}
?>
