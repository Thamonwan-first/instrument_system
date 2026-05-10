<?php
// api/staff/update_booking.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $booking_id = $_POST['booking_id'] ?? 0;
    $status = $_POST['status'] ?? ''; // approved, rejected, cancelled

    if ($booking_id && in_array($status, ['approved', 'rejected', 'cancelled'])) {
        $stmt = $conn->prepare("UPDATE bookings SET status = ? WHERE id = ?");
        if ($stmt->execute([$status, $booking_id])) {
            
            // Send notification if status changed
            $stmtBooking = $conn->prepare("SELECT user_id, equipment_id FROM bookings WHERE id = ?");
            $stmtBooking->execute([$booking_id]);
            $booking = $stmtBooking->fetch(PDO::FETCH_ASSOC);
            
            if ($booking) {
                $stmtEq = $conn->prepare("SELECT name FROM equipment WHERE id = ?");
                $stmtEq->execute([$booking['equipment_id']]);
                $eq = $stmtEq->fetch(PDO::FETCH_ASSOC);
                
                $title = "อัปเดตสถานะการจอง";
                $message = "การจองเครื่องมือ {$eq['name']} ของคุณได้รับการ{$status}";
                
                $stmtNotif = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
                $notifType = $status === 'approved' ? 'success' : ($status === 'rejected' ? 'error' : 'info');
                $stmtNotif->execute([$booking['user_id'], $title, $message, $notifType]);
            }

            echo json_encode(["message" => "อัปเดตสถานะสำเร็จ"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "ไม่สามารถอัปเดตข้อมูลได้"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "ข้อมูลไม่ถูกต้อง"]);
    }
}
?>
