<?php
// api/booking.php
include 'config.php';

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Action: create_booking
    $user_id = $data->user_id ?? 0;
    $instrument_id = $data->instrument_id ?? 0;
    $start_date = $data->start_date ?? '';
    $end_date = $data->end_date ?? '';

    if ($user_id && $instrument_id && $start_date && $end_date) {
        // 1. ตรวจสอบการจองทับซ้อน (Overlap Check)
        $check_query = "SELECT id FROM bookings 
                        WHERE instrument_id = ? 
                        AND status != 'cancelled'
                        AND (
                            (start_date <= ? AND end_date >= ?) OR 
                            (start_date <= ? AND end_date >= ?) OR
                            (? <= start_date AND ? >= end_date)
                        )";
        $stmt = $conn->prepare($check_query);
        $stmt->execute([$instrument_id, $start_date, $start_date, $end_date, $end_date, $start_date, $end_date]);
        
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["message" => "ช่วงเวลาที่เลือกมีผู้ใช้งานอื่นจองไว้แล้ว"]);
            exit;
        }

        // 2. บันทึกการจอง
        $query = "INSERT INTO bookings (user_id, instrument_id, start_date, end_date, status) VALUES (?, ?, ?, ?, 'pending')";
        $stmt = $conn->prepare($query);
        if ($stmt->execute([$user_id, $instrument_id, $start_date, $end_date])) {
            echo json_encode(["message" => "ส่งคำขอจองสำเร็จ! กรุณารอเจ้าหน้าที่อนุมัติ"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "ไม่สามารถบันทึกการจองได้"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "ข้อมูลไม่ครบถ้วน"]);
    }
} 
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // ดึงรายการจองของเครื่องมือตัวนั้นๆ เพื่อแสดงในหน้าจอ
    $instrument_id = $_GET['instrument_id'] ?? 0;
    if ($instrument_id) {
        $query = "SELECT b.*, u.first_name, u.last_name 
                  FROM bookings b 
                  JOIN users u ON b.user_id = u.id 
                  WHERE b.instrument_id = ? AND b.status != 'cancelled'
                  ORDER BY b.start_date ASC";
        $stmt = $conn->prepare($query);
        $stmt->execute([$instrument_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        // ถ้าไม่ส่ง ID มา ให้ดึงรายการของ User คนนั้นๆ
        $user_id = $_GET['user_id'] ?? 0;
        $query = "SELECT b.*, i.name as instrument_name 
                  FROM bookings b 
                  JOIN instruments i ON b.instrument_id = i.id 
                  WHERE b.user_id = ? 
                  ORDER BY b.start_date DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}
?>