<?php
// api/student/get_personal_statistics.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$user_id = $_GET['user_id'] ?? null;
$period = $_GET['period'] ?? 'month'; // week, month, year

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["error" => "user_id required"]);
    exit;
}

// Calculate date range
$endDate = date('Y-m-d');
switch($period) {
    case 'week':
        $startDate = date('Y-m-d', strtotime('-7 days'));
        break;
    case 'month':
        $startDate = date('Y-m-d', strtotime('-30 days'));
        break;
    case 'year':
        $startDate = date('Y-m-d', strtotime('-365 days'));
        break;
    default:
        $startDate = date('Y-m-d', strtotime('-30 days'));
}

try {
    // Daily usage data
    $dailyQuery = "SELECT DATE(check_in) as usage_date, 
                          COUNT(*) as session_count,
                          ROUND(AVG(IFNULL(duration_min, 0)), 2) as avg_duration
                   FROM usage_logs
                   WHERE user_id = ? AND DATE(check_in) BETWEEN ? AND ?
                   GROUP BY DATE(check_in)
                   ORDER BY usage_date ASC";
    
    $dailyStmt = $conn->prepare($dailyQuery);
    $dailyStmt->execute([$user_id, $startDate, $endDate]);
    $dailyStats = $dailyStmt->fetchAll(PDO::FETCH_ASSOC);

    // Most used equipment
    $equipmentQuery = "SELECT e.id, e.name, e.code,
                             COUNT(ul.id) as usage_count,
                             ROUND(AVG(IFNULL(ul.duration_min, 0)), 2) as avg_duration
                      FROM equipment e
                      JOIN usage_logs ul ON e.id = ul.equipment_id
                      WHERE ul.user_id = ? AND DATE(ul.check_in) BETWEEN ? AND ?
                      GROUP BY e.id
                      ORDER BY usage_count DESC
                      LIMIT 10";
    
    $equipmentStmt = $conn->prepare($equipmentQuery);
    $equipmentStmt->execute([$user_id, $startDate, $endDate]);
    $frequentEquipment = $equipmentStmt->fetchAll(PDO::FETCH_ASSOC);

    // Total statistics
    $totalQuery = "SELECT COUNT(*) as total_sessions,
                          ROUND(SUM(IFNULL(duration_min, 0)) / 60, 2) as total_hours,
                          ROUND(AVG(IFNULL(duration_min, 0)), 2) as avg_duration,
                          COUNT(DISTINCT equipment_id) as unique_equipment
                   FROM usage_logs
                   WHERE user_id = ? AND DATE(check_in) BETWEEN ? AND ?";
    
    $totalStmt = $conn->prepare($totalQuery);
    $totalStmt->execute([$user_id, $startDate, $endDate]);
    $totals = $totalStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "period" => $period,
        "start_date" => $startDate,
        "end_date" => $endDate,
        "daily_stats" => $dailyStats,
        "frequent_equipment" => $frequentEquipment,
        "totals" => $totals
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
