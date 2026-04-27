<?php
// api/usage_log.php
include 'config.php';

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Action: check_in หรือ check_out
    $action = $data->action ?? '';
    $user_id = $data->user_id ?? 0;
    $instrument_id = $data->instrument_id ?? 0;

    if ($action === 'check_in') {
        // ตรวจสอบว่าเช็คอินค้างไว้หรือไม่
        $stmt = $conn->prepare("SELECT id FROM usage_logs WHERE user_id = ? AND check_out IS NULL");
        $stmt->execute([$user_id]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["message" => "คุณมีการใช้งานเครื่องมืออื่นค้างอยู่ กรุณา Check-out ก่อน"]);
            exit;
        }

        $query = "INSERT INTO usage_logs (user_id, instrument_id, check_in) VALUES (?, ?, NOW())";
        $stmt = $conn->prepare($query);
        if ($stmt->execute([$user_id, $instrument_id])) {
            echo json_encode(["message" => "Check-in สำเร็จ เริ่มบันทึกการใช้งาน"]);
        }
    } 
    else if ($action === 'check_out') {
        $feedback = $data->feedback ?? '';
        $query = "UPDATE usage_logs SET check_out = NOW(), feedback = ? WHERE user_id = ? AND instrument_id = ? AND check_out IS NULL";
        $stmt = $conn->prepare($query);
        if ($stmt->execute([$feedback, $user_id, $instrument_id])) {
            echo json_encode(["message" => "Check-out สำเร็จ ขอบคุณที่ใช้บริการ"]);
        }
    }
} 
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // ดึงประวัติการใช้งาน (สำหรับกราฟ GitHub)
    $user_id = $_GET['user_id'] ?? 0;
    $query = "SELECT DATE(check_in) as date, COUNT(*) as count FROM usage_logs WHERE user_id = ? GROUP BY DATE(check_in)";
    $stmt = $conn->prepare($query);
    $stmt->execute([$user_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>