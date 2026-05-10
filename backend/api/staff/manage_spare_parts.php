<?php
// api/staff/manage_spare_parts.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM spare_parts ORDER BY name");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else if ($method === 'POST') {
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $quantity = $_POST['quantity'] ?? 0;
    $unit = $_POST['unit'] ?? 'ชิ้น';

    $stmt = $conn->prepare("INSERT INTO spare_parts (name, description, quantity, unit) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$name, $description, $quantity, $unit])) {
        echo json_encode(["message" => "เพิ่มอะไหล่สำเร็จ"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "ไม่สามารถบันทึกได้"]);
    }
} else if ($method === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);
    $id = $_PUT['id'] ?? 0;
    $quantity = $_PUT['quantity'] ?? 0;

    $stmt = $conn->prepare("UPDATE spare_parts SET quantity = ? WHERE id = ?");
    if ($stmt->execute([$quantity, $id])) {
        echo json_encode(["message" => "อัปเดตสต็อกสำเร็จ"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "ไม่สามารถอัปเดตได้"]);
    }
}
?>
