<?php
// api/ceo/get_usage_trends.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

try {
    // Daily usage trend (last 90 days)
    $dailyQuery = "SELECT 
                    DATE(check_in) as date,
                    COUNT(*) as sessions,
                    COUNT(DISTINCT user_id) as users,
                    SUM(duration_min)/60 as total_hours,
                    COUNT(DISTINCT equipment_id) as equipment_used
                  FROM usage_logs
                  WHERE check_in >= DATE_SUB(NOW(), INTERVAL 90 DAY)
                  GROUP BY DATE(check_in)
                  ORDER BY date DESC";
    
    $dailyStmt = $conn->prepare($dailyQuery);
    $dailyStmt->execute();
    $dailyTrend = $dailyStmt->fetchAll(PDO::FETCH_ASSOC);

    // Equipment popularity trend (top 10 over 6 months)
    $equipTrendQuery = "SELECT 
                         e.id, e.name,
                         DATE_FORMAT(ul.check_in, '%Y-%m') as month,
                         COUNT(ul.id) as usages
                       FROM equipment e
                       JOIN usage_logs ul ON e.id = ul.equipment_id
                       WHERE ul.check_in >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                       AND e.id IN (
                         SELECT equipment_id 
                         FROM usage_logs 
                         WHERE check_in >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                         GROUP BY equipment_id
                         ORDER BY COUNT(*) DESC
                         LIMIT 10
                       )
                       GROUP BY e.id, DATE_FORMAT(ul.check_in, '%Y-%m')
                       ORDER BY month, e.id";
    
    $equipTrendStmt = $conn->prepare($equipTrendQuery);
    $equipTrendStmt->execute();
    $equipTrend = $equipTrendStmt->fetchAll(PDO::FETCH_ASSOC);

    // Day-of-week patterns
    $dayPatternQuery = "SELECT 
                         DAYNAME(check_in) as day_name,
                         DAYOFWEEK(check_in) as day_num,
                         COUNT(*) as sessions,
                         AVG(duration_min) as avg_duration
                       FROM usage_logs
                       WHERE check_in >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                       GROUP BY DAYOFWEEK(check_in)
                       ORDER BY day_num";
    
    $dayStmt = $conn->prepare($dayPatternQuery);
    $dayStmt->execute();
    $dayPattern = $dayStmt->fetchAll(PDO::FETCH_ASSOC);

    // Hour-of-day patterns
    $hourPatternQuery = "SELECT 
                         HOUR(check_in) as hour,
                         COUNT(*) as sessions,
                         COUNT(DISTINCT user_id) as users,
                         AVG(duration_min) as avg_duration
                       FROM usage_logs
                       WHERE check_in >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                       GROUP BY HOUR(check_in)
                       ORDER BY hour";
    
    $hourStmt = $conn->prepare($hourPatternQuery);
    $hourStmt->execute();
    $hourPattern = $hourStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "daily_trend" => $dailyTrend,
        "equipment_trend" => $equipTrend,
        "day_pattern" => $dayPattern,
        "hour_pattern" => $hourPattern
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
