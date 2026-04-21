<?php
// instrument_system/api/add_item.php
include 'config.php';

$instrumentModel = new Instrument($conn);
$type = $_POST['type'] ?? '';

if ($type == 'building') {
    $name = $_POST['name'] ?? '';
    if ($name && $instrumentModel->addBuilding($name)) {
        echo json_encode(["message" => "Building added successfully"]);
    }
} else if ($type == 'room') {
    $building_id = $_POST['building_id'] ?? '';
    $name = $_POST['name'] ?? '';
    if ($building_id && $name && $instrumentModel->addRoom($building_id, $name)) {
        echo json_encode(["message" => "Room added successfully"]);
    }
} else if ($type == 'instrument') {
    $data = [
        'room_id' => $_POST['room_id'] ?? '',
        'name' => $_POST['name'] ?? '',
        'description' => $_POST['description'] ?? '',
        'price' => $_POST['price'] ?? 0,
        'rules' => $_POST['rules'] ?? '',
        'image_path' => null,
        'manual_pdf' => null
    ];

    // Handle Image Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $target = "uploads/images/" . time() . "_" . $_FILES['image']['name'];
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
            $data['image_path'] = $target;
        }
    }

    // Handle PDF Upload
    if (isset($_FILES['manual']) && $_FILES['manual']['error'] == 0) {
        $target = "uploads/manuals/" . time() . "_" . $_FILES['manual']['name'];
        if (move_uploaded_file($_FILES['manual']['tmp_name'], $target)) {
            $data['manual_pdf'] = $target;
        }
    }

    if ($data['room_id'] && $data['name'] && $instrumentModel->addInstrument($data)) {
        echo json_encode(["message" => "Instrument added successfully"]);
    }
} else {
    echo json_encode(["message" => "Invalid type"]);
}
?>