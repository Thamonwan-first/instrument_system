<?php
// api/staff/get_usage_statistics.php
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$period = $_GET['period'] ?? 'month'; // 'week', 'month', 'year'
$equipment_id = $_GET['equipment_id'] ?? null;

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
    // Get daily usage statistics
    if ($equipment_id) {
        // Single equipment stats
        $query = "SELECT 
                    DATE(check_in) as usage_date,
                    COUNT(*) as session_count,
                    ROUND(AVG(IFNULL(duration_min, 0)), 2) as avg_duration
                  FROM usage_logs
                  WHERE equipment_id = ? AND DATE(check_in) BETWEEN ? AND ?
                  GROUP BY DATE(check_in)
                  ORDER BY usage_date ASC";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([$equipment_id, $startDate, $endDate]);
    } else {
        // All equipment stats
        $query = "SELECT 
                    DATE(check_in) as usage_date,
                    COUNT(*) as session_count,
                    COUNT(DISTINCT equipment_id) as unique_equipment,
                    ROUND(AVG(IFNULL(duration_min, 0)), 2) as avg_duration
                  FROM usage_logs
                  WHERE DATE(check_in) BETWEEN ? AND ?
                  GROUP BY DATE(check_in)
                  ORDER BY usage_date ASC";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([$startDate, $endDate]);
    }

    $dailyStats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get equipment popularity (top 10)
    $popularQuery = "SELECT 
                      e.id, e.code, e.name,
                      COUNT(ul.id) as usage_count,
                      ROUND(AVG(IFNULL(ul.duration_min, 0)), 2) as avg_duration
                    FROM equipment e
                    LEFT JOIN usage_logs ul ON e.id = ul.equipment_id AND DATE(ul.check_in) BETWEEN ? AND ?
                    GROUP BY e.id
                    ORDER BY usage_count DESC
                    LIMIT 10";
    
    $popularStmt = $conn->prepare($popularQuery);
    $popularStmt->execute([$startDate, $endDate]);
    $popular = $popularStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get status distribution
    $statusQuery = "SELECT status, COUNT(*) as count FROM equipment GROUP BY status";
    $statusStmt = $conn->prepare($statusQuery);
    $statusStmt->execute();
    $statusDist = $statusStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "period" => $period,
        "start_date" => $startDate,
        "end_date" => $endDate,
        "daily_stats" => $dailyStats,
        "popular_equipment" => $popular,
        "status_distribution" => $statusDist
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch statistics: " . $e->getMessage()]);
}
?>
