<?php
// api/staff/update_building.php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/Instrument.php';

header('Content-Type: application/json');

$id = $_POST['id'] ?? null;
$name = $_POST['name'] ?? null;
$code = $_POST['code'] ?? null;

if (!$id || !$name) {
    http_response_code(400);
    echo json_encode(["error" => "Building ID and name required"]);
    exit;
}

$instrumentModel = new Instrument($conn);
if ($instrumentModel->updateBuilding($id, $name, $code)) {
    echo json_encode(["message" => "Building updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update building"]);
}
?>
