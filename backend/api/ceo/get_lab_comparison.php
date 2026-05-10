<?php
// api/ceo/get_lab_comparison.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

try {
    $query = "SELECT 
                b.id, b.name, b.code,
                COUNT(DISTINCT r.id) as room_count,
                COUNT(DISTINCT e.id) as equipment_count,
                SUM(CAST(e.price AS DECIMAL(10,2))) as total_investment,
                COUNT(ul.id) as total_usages,
                COUNT(DISTINCT ul.user_id) as unique_users,
                COUNT(DISTINCT DATE(ul.check_in)) as days_with_usage,
                SUM(ul.duration_min)/60 as total_hours,
                ROUND(COUNT(ul.id) / (COUNT(DISTINCT e.id) + 1), 2) as avg_usage_per_equipment,
                ROUND(SUM(CAST(e.price AS DECIMAL(10,2))) / (COUNT(ul.id) + 1), 2) as cost_per_usage,
                DATE_FORMAT(MAX(ul.check_in), '%Y-%m-%d') as last_activity
              FROM buildings b
              LEFT JOIN rooms r ON b.id = r.building_id AND r.is_active = 1
              LEFT JOIN equipment e ON r.id = e.room_id
              LEFT JOIN usage_logs ul ON e.id = ul.equipment_id
              WHERE b.is_active = 1
              GROUP BY b.id
              ORDER BY total_usages DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $buildings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add efficiency score
    $comparison = array_map(function($b) {
        $efficiency = 0;
        if ($b['total_usages'] > 500) $efficiency += 3;
        elseif ($b['total_usages'] > 200) $efficiency += 2;
        elseif ($b['total_usages'] > 50) $efficiency += 1;
        
        if ($b['cost_per_usage'] < 200) $efficiency += 3;
        elseif ($b['cost_per_usage'] < 500) $efficiency += 2;
        
        if ($b['unique_users'] > 30) $efficiency += 2;
        
        return array_merge($b, [
            'efficiency_score' => $efficiency,
            'efficiency_level' => $efficiency >= 7 ? 'Excellent' : ($efficiency >= 4 ? 'Good' : 'Needs Improvement')
        ]);
    }, $buildings);

    echo json_encode([
        "comparison" => $comparison,
        "summary" => [
            "total_labs" => count($comparison),
            "total_equipment" => array_sum(array_map(fn($b) => $b['equipment_count'], $comparison)),
            "total_investment" => array_sum(array_map(fn($b) => $b['total_investment'] ?? 0, $comparison)),
            "total_usages" => array_sum(array_map(fn($b) => $b['total_usages'], $comparison))
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
