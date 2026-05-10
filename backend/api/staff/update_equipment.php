<?php
// api/staff/update_equipment.php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/Instrument.php';

header('Content-Type: application/json');

$equipment_id = $_POST['id'] ?? null;

if (!$equipment_id) {
    http_response_code(400);
    echo json_encode(["error" => "Equipment ID required"]);
    exit;
}

$data = [
    'id' => $equipment_id,
    'room_id' => $_POST['room_id'] ?? null,
    'category_id' => $_POST['category_id'] ?? null,
    'code' => $_POST['code'] ?? null,
    'name' => $_POST['name'] ?? null,
    'brand' => $_POST['brand'] ?? null,
    'model' => $_POST['model'] ?? null,
    'serial_number' => $_POST['serial_number'] ?? null,
    'purchase_price' => $_POST['purchase_price'] ?? null,
    'status' => $_POST['status'] ?? 'available',
    'description' => $_POST['description'] ?? null,
    'usage_rules' => $_POST['usage_rules'] ?? null,
    'is_bookable' => $_POST['is_bookable'] ?? 1,
];

// Handle image upload if provided
if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] == 0) {
    $target_dir = __DIR__ . "/../../uploads/images/";
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0755, true);
    }
    $filename = time() . "_" . basename($_FILES['thumbnail']['name']);
    if (move_uploaded_file($_FILES['thumbnail']['tmp_name'], $target_dir . $filename)) {
        $data['image_path'] = "backend/uploads/images/" . $filename;
    }
}

$instrumentModel = new Instrument($conn);
if ($instrumentModel->updateEquipment($data)) {
    echo json_encode(["message" => "Equipment updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update equipment"]);
}
?>
