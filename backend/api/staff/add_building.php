<?php
// api/staff/add_building.php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/Instrument.php';

header('Content-Type: application/json');

$name = $_POST['name'] ?? null;
$code = $_POST['code'] ?? null;

if (!$name) {
    http_response_code(400);
    echo json_encode(["error" => "Building name required"]);
    exit;
}

$instrumentModel = new Instrument($conn);
if ($instrumentModel->addBuilding($name, $code)) {
    echo json_encode(["message" => "Building added successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to add building"]);
}
?>
