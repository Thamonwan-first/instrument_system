<?php
// api/student/usage_log.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $data->action ?? '';
    $user_id = $data->user_id ?? 0;
    
    if ($action === 'check_in') {
        $qr_token = $data->qr_token ?? ''; // New schema uses qr_token
        
        // Calling stored procedure sp_checkin
        $stmt = $conn->prepare("CALL sp_checkin(?, ?, @p_log_id, @p_msg)");
        $stmt->execute([$qr_token, $user_id]);
        
        $res = $conn->query("SELECT @p_log_id as log_id, @p_msg as message")->fetch(PDO::FETCH_ASSOC);
        
        if ($res['log_id'] > 0) {
            $log_id = $res['log_id'];
            
            // Try to find a relevant approved booking for today to link
            $stmt = $conn->prepare("SELECT id FROM bookings 
                                    WHERE user_id = ? 
                                    AND equipment_id = (SELECT equipment_id FROM usage_logs WHERE id = ?) 
                                    AND status = 'approved' 
                                    AND DATE(start_time) = CURDATE()
                                    LIMIT 1");
            $stmt->execute([$user_id, $log_id]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($booking) {
                $conn->prepare("UPDATE usage_logs SET booking_id = ? WHERE id = ?")->execute([$booking['id'], $log_id]);
                // Update booking status to reflect it's being used
                $conn->prepare("UPDATE bookings SET status = 'approved' WHERE id = ?")->execute([$booking['id']]); 
                // Note: We keep it 'approved' or could use a new 'active' status if we had one, 
                // but 'approved' is fine. We'll mark it 'completed' on checkout.
            }
            
            echo json_encode(["message" => $res['message'], "log_id" => $log_id]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => $res['message']]);
        }
    } 
    else if ($action === 'check_out') {
        $log_id = $data->log_id ?? 0;
        
        // Calling stored procedure sp_checkout
        $stmt = $conn->prepare("CALL sp_checkout(?, @p_duration, @p_msg)");
        $stmt->execute([$log_id]);
        
        $res = $conn->query("SELECT @p_duration as duration, @p_msg as message")->fetch(PDO::FETCH_ASSOC);
        
        if ($res['message'] && strpos($res['message'], 'สำเร็จ') !== false) {
            // Update linked booking to completed if it exists
            $stmt = $conn->prepare("SELECT booking_id FROM usage_logs WHERE id = ?");
            $stmt->execute([$log_id]);
            $log = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($log && $log['booking_id']) {
                $conn->prepare("UPDATE bookings SET status = 'completed' WHERE id = ?")->execute([$log['booking_id']]);
            }
            echo json_encode(["message" => $res['message'], "duration" => $res['duration']]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => $res['message']]);
        }
    }
} 
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // ดึงประวัติการใช้งาน (สำหรับกราฟ GitHub) - Using view v_usage_stats_daily
    $user_id = $_GET['user_id'] ?? 0;
    $query = "SELECT usage_date as date, session_count as count FROM v_usage_stats_daily WHERE user_id = ? GROUP BY usage_date";
    // Note: The view v_usage_stats_daily in the provided SQL didn't include user_id, 
    // but the original usage_logs table has it. Let's use direct table query if view lacks user_id.
    $query = "SELECT DATE(check_in) as date, COUNT(*) as count FROM usage_logs WHERE user_id = ? GROUP BY DATE(check_in)";
    $stmt = $conn->prepare($query);
    $stmt->execute([$user_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>
