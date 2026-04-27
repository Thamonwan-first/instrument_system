<?php
// api/get_instrument_details.php
include 'config.php';

header("Content-Type: application/json");

$id = $_GET['id'] ?? 0;

if ($id > 0) {
    $query = "SELECT i.*, r.name as room_name, b.name as building_name 
              FROM instruments i
              JOIN rooms r ON i.room_id = r.id
              JOIN buildings b ON r.building_id = b.id
              WHERE i.id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    $instrument = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($instrument) {
        // จำลองข้อมูลเจ้าหน้าที่รับผิดชอบ (ในระบบจริงอาจมีตาราง staff_assignments)
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