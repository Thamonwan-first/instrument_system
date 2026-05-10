<?php
// api/admin/get_system_dashboard.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

try {
    // Total users
    $userQuery = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as students,
                    SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as staff,
                    SUM(CASE WHEN role_id = 1 THEN 1 ELSE 0 END) as admins,
                    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
                  FROM users";
    
    $userStmt = $conn->prepare($userQuery);
    $userStmt->execute();
    $userStats = $userStmt->fetch(PDO::FETCH_ASSOC);

    // Equipment statistics
    $equipQuery = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
                    SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) as in_use,
                    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
                    SUM(CASE WHEN status = 'retired' THEN 1 ELSE 0 END) as retired
                  FROM equipment";
    
    $equipStmt = $conn->prepare($equipQuery);
    $equipStmt->execute();
    $equipStats = $equipStmt->fetch(PDO::FETCH_ASSOC);

    // Bookings today
    $bookingQuery = "SELECT 
                      COUNT(*) as total,
                      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
                    FROM bookings WHERE DATE(created_at) = CURDATE()";
    
    $bookingStmt = $conn->prepare($bookingQuery);
    $bookingStmt->execute();
    $bookingStats = $bookingStmt->fetch(PDO::FETCH_ASSOC);

    // Pending repairs
    $repairQuery = "SELECT 
                      COUNT(*) as total,
                      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
                      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high
                    FROM repair_reports WHERE status IN ('open', 'in_progress')";
    
    $repairStmt = $conn->prepare($repairQuery);
    $repairStmt->execute();
    $repairStats = $repairStmt->fetch(PDO::FETCH_ASSOC);

    // Staff approvals pending
    $approvalQuery = "SELECT COUNT(*) as pending FROM staff_approvals WHERE status = 'pending'";
    $approvalStmt = $conn->prepare($approvalQuery);
    $approvalStmt->execute();
    $approvalStats = $approvalStmt->fetch(PDO::FETCH_ASSOC);

    // Recent audit logs
    $auditQuery = "SELECT al.*, u.first_name, u.last_name FROM audit_logs al
                   LEFT JOIN users u ON al.user_id = u.id
                   ORDER BY al.created_at DESC LIMIT 10";
    $auditStmt = $conn->prepare($auditQuery);
    $auditStmt->execute();
    $recentLogs = $auditStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "users" => $userStats,
        "equipment" => $equipStats,
        "bookings" => $bookingStats,
        "repairs" => $repairStats,
        "staff_approvals_pending" => $approvalStats['pending'],
        "recent_logs" => $recentLogs
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
