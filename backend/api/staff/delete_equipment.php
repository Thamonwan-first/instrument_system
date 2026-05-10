<?php
// api/staff/delete_equipment.php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/Instrument.php';

header('Content-Type: application/json');

$equipment_id = $_POST['id'] ?? null;

if (!$equipment_id) {
    http_response_code(400);
    echo json_encode(["error" => "Equipment ID required"]);
    exit;
}

$instrumentModel = new Instrument($conn);
if ($instrumentModel->deleteEquipment($equipment_id)) {
    echo json_encode(["message" => "Equipment deleted successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete equipment"]);
}
?>
