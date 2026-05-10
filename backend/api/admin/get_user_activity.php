<?php
// api/admin/get_user_activity.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$user_id = $_GET['user_id'] ?? null;
$limit = $_GET['limit'] ?? 50;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["error" => "user_id required"]);
    exit;
}

try {
    // Get user activity (login/logout, bookings, issues, etc)
    $query = "SELECT al.* FROM audit_logs al
              WHERE al.user_id = ?
              ORDER BY al.created_at DESC
              LIMIT ?";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$user_id, $limit]);
    $activity = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get usage statistics
    $usageQuery = "SELECT COUNT(*) as total_sessions,
                          SUM(IFNULL(duration_min, 0))/60 as total_hours,
                          COUNT(DISTINCT DATE(check_in)) as days_used,
                          MAX(check_in) as last_usage
                   FROM usage_logs WHERE user_id = ?";
    
    $usageStmt = $conn->prepare($usageQuery);
    $usageStmt->execute([$user_id]);
    $usage = $usageStmt->fetch(PDO::FETCH_ASSOC);

    // Get bookings summary
    $bookingQuery = "SELECT 
                      COUNT(*) as total_bookings,
                      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
                    FROM bookings WHERE user_id = ?";
    
    $bookingStmt = $conn->prepare($bookingQuery);
    $bookingStmt->execute([$user_id]);
    $bookings = $bookingStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "activity" => $activity,
        "usage" => $usage,
        "bookings" => $bookings
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
