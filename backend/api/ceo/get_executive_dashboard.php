<?php
// api/ceo/get_executive_dashboard.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

try {
    // Key metrics overview
    $metricsQuery = "SELECT 
                      (SELECT COUNT(*) FROM equipment) as total_equipment,
                      (SELECT COUNT(DISTINCT user_id) FROM usage_logs) as active_users,
                      (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURDATE()) as today_bookings,
                      (SELECT COUNT(*) FROM bookings WHERE status = 'approved') as total_approved_bookings,
                      (SELECT AVG(duration_min) FROM usage_logs) as avg_session_minutes
                    ";
    
    $metricsStmt = $conn->prepare($metricsQuery);
    $metricsStmt->execute();
    $metrics = $metricsStmt->fetch(PDO::FETCH_ASSOC);

    // Equipment investment summary
    $investmentQuery = "SELECT 
                         COUNT(*) as total_count,
                         SUM(CAST(price AS DECIMAL(10,2))) as total_investment,
                         AVG(CAST(price AS DECIMAL(10,2))) as avg_price,
                         SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_count,
                         SUM(CASE WHEN status = 'retired' THEN 1 ELSE 0 END) as retired_count
                       FROM equipment";
    
    $investStmt = $conn->prepare($investmentQuery);
    $investStmt->execute();
    $investment = $investStmt->fetch(PDO::FETCH_ASSOC);

    // Top used equipment with ROI estimate
    $topEquipQuery = "SELECT 
                       e.id, e.name, e.price,
                       COUNT(ul.id) as usage_count,
                       COUNT(DISTINCT ul.user_id) as unique_users,
                       SUM(ul.duration_min) as total_minutes,
                       CAST(e.price AS DECIMAL(10,2)) / (COUNT(ul.id) + 1) as cost_per_use
                     FROM equipment e
                     LEFT JOIN usage_logs ul ON e.id = ul.equipment_id
                     GROUP BY e.id
                     ORDER BY COUNT(ul.id) DESC
                     LIMIT 15";
    
    $topEquipStmt = $conn->prepare($topEquipQuery);
    $topEquipStmt->execute();
    $topEquipment = $topEquipStmt->fetchAll(PDO::FETCH_ASSOC);

    // Monthly booking trend
    $trendQuery = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as booking_count,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count
                  FROM bookings
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                  ORDER BY month";
    
    $trendStmt = $conn->prepare($trendQuery);
    $trendStmt->execute();
    $trends = $trendStmt->fetchAll(PDO::FETCH_ASSOC);

    // Building/Room utilization
    $utilizationQuery = "SELECT 
                         b.id, b.name,
                         COUNT(DISTINCT r.id) as room_count,
                         COUNT(DISTINCT e.id) as equipment_count,
                         COUNT(ul.id) as total_usages,
                         ROUND(COUNT(ul.id) / (COUNT(DISTINCT e.id) + 1), 2) as avg_uses_per_equipment
                       FROM buildings b
                       LEFT JOIN rooms r ON b.id = r.building_id
                       LEFT JOIN equipment e ON r.id = e.room_id
                       LEFT JOIN usage_logs ul ON e.id = ul.equipment_id
                       WHERE b.is_active = 1
                       GROUP BY b.id
                       ORDER BY total_usages DESC";
    
    $utilizStmt = $conn->prepare($utilizationQuery);
    $utilizStmt->execute();
    $utilization = $utilizStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "metrics" => $metrics,
        "investment" => $investment,
        "top_equipment" => $topEquipment,
        "trends" => $trends,
        "building_utilization" => $utilization
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
