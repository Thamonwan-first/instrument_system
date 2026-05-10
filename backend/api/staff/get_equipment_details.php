<?php
// api/staff/get_equipment_details.php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/Instrument.php';

header('Content-Type: application/json');

$equipment_id = $_GET['id'] ?? null;

if (!$equipment_id) {
    http_response_code(400);
    echo json_encode(["error" => "Equipment ID required"]);
    exit;
}

$instrumentModel = new Instrument($conn);
$equipment = $instrumentModel->getEquipmentById($equipment_id);

if (!$equipment) {
    http_response_code(404);
    echo json_encode(["error" => "Equipment not found"]);
    exit;
}

echo json_encode($equipment);
?>
