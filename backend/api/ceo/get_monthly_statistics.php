<?php
// api/ceo/get_monthly_statistics.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$months = $_GET['months'] ?? 6;

try {
    $query = "SELECT 
                DATE_FORMAT(ul.check_in, '%Y-%m') as month,
                COUNT(DISTINCT DATE(ul.check_in)) as active_days,
                COUNT(ul.id) as total_sessions,
                COUNT(DISTINCT ul.user_id) as unique_users,
                SUM(ul.duration_min)/60 as total_hours,
                ROUND(AVG(ul.duration_min), 2) as avg_duration_minutes,
                COUNT(DISTINCT ul.equipment_id) as equipment_used,
                COUNT(DISTINCT b.id) as buildings_used
              FROM usage_logs ul
              LEFT JOIN equipment e ON ul.equipment_id = e.id
              LEFT JOIN rooms r ON e.room_id = r.id
              LEFT JOIN buildings b ON r.building_id = b.id
              WHERE ul.check_in >= DATE_SUB(NOW(), INTERVAL ? MONTH)
              GROUP BY DATE_FORMAT(ul.check_in, '%Y-%m')
              ORDER BY month DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$months]);
    $statistics = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // User activity by role
    $roleQuery = "SELECT 
                   u.role_id,
                   COUNT(ul.id) as total_usages,
                   COUNT(DISTINCT u.id) as user_count,
                   SUM(ul.duration_min)/60 as total_hours
                 FROM usage_logs ul
                 JOIN equipment e ON ul.equipment_id = e.id
                 JOIN users u ON ul.user_id = u.id
                 WHERE ul.check_in >= DATE_SUB(NOW(), INTERVAL ? MONTH)
                 GROUP BY u.role_id";
    
    $roleStmt = $conn->prepare($roleQuery);
    $roleStmt->execute([$months]);
    $roleStats = $roleStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "monthly_stats" => $statistics,
        "role_stats" => $roleStats,
        "period_months" => $months
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
