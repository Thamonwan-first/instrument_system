<?php
// api/common/get_instrument_details.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$id = $_GET['id'] ?? 0;

if ($id > 0) {
    $query = "SELECT * FROM v_equipment_full WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    $instrument = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($instrument) {
        // Mock staff data if not in schema yet
        $instrument['responsible_staff'] = "คุณวิชัย สายซ่อม";
        $instrument['staff_email'] = "wichai.tool@univ.ac.th";
        $instrument['staff_phone'] = "081-999-XXXX";
        
        echo json_encode($instrument);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "ไม่พบข้อมูลเครื่องมือ"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ID ไม่ถูกต้อง"]);
}
?>
