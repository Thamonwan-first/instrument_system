<?php
// api/staff/delete_room.php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/Instrument.php';

header('Content-Type: application/json');

$id = $_POST['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "Room ID required"]);
    exit;
}

$instrumentModel = new Instrument($conn);
if ($instrumentModel->deleteRoom($id)) {
    echo json_encode(["message" => "Room deleted successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete room"]);
}
?>
