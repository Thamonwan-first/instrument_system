<?php
// api/ceo/get_equipment_recommendations.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

try {
    // Find high-demand equipment categories (most frequently requested)
    $demandQuery = "SELECT 
                     c.id, c.name as category,
                     COUNT(DISTINCT e.id) as current_count,
                     COUNT(ul.id) as total_usages,
                     SUM(CAST(e.price AS DECIMAL(10,2))) as category_investment,
                     AVG(CAST(e.price AS DECIMAL(10,2))) as avg_price,
                     ROUND(COUNT(ul.id) / NULLIF(COUNT(DISTINCT e.id), 0), 2) as avg_usage_per_unit
                   FROM categories c
                   LEFT JOIN equipment e ON c.id = e.category_id
                   LEFT JOIN usage_logs ul ON e.id = ul.equipment_id
                   GROUP BY c.id
                   ORDER BY COUNT(ul.id) DESC";
    
    $demandStmt = $conn->prepare($demandQuery);
    $demandStmt->execute();
    $demand = $demandStmt->fetchAll(PDO::FETCH_ASSOC);

    // Equipment with highest wait times (booked but not available)
    $waitTimeQuery = "SELECT 
                       e.id, e.name, c.name as category,
                       COUNT(b.id) as total_bookings,
                       SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
                       ROUND(COUNT(b.id) / NULLIF(COUNT(DISTINCT DATE(b.created_at)), 0), 2) as bookings_per_day,
                       ROUND(SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) / COUNT(b.id) * 100, 2) as pending_percentage
                     FROM equipment e
                     LEFT JOIN categories c ON e.category_id = c.id
                     LEFT JOIN bookings b ON e.id = b.equipment_id
                     WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
                     GROUP BY e.id
                     HAVING pending_bookings > 0
                     ORDER BY pending_percentage DESC
                     LIMIT 10";
    
    $waitStmt = $conn->prepare($waitTimeQuery);
    $waitStmt->execute();
    $waitTimes = $waitStmt->fetchAll(PDO::FETCH_ASSOC);

    // Underutilized equipment recommendations for replacement
    $underutilQuery = "SELECT 
                        e.id, e.name, e.price, c.name as category,
                        e.status,
                        COUNT(ul.id) as total_usages,
                        DATEDIFF(NOW(), MAX(ul.check_in)) as days_since_use,
                        ROUND(CAST(e.price AS DECIMAL(10,2)) / (COUNT(ul.id) + 1), 2) as cost_per_use
                      FROM equipment e
                      LEFT JOIN categories c ON e.category_id = c.id
                      LEFT JOIN usage_logs ul ON e.id = ul.equipment_id
                      GROUP BY e.id
                      HAVING COUNT(ul.id) < 5 AND (DATEDIFF(NOW(), MAX(ul.check_in)) > 90 OR MAX(ul.check_in) IS NULL)
                      ORDER BY CAST(e.price AS DECIMAL(10,2)) DESC
                      LIMIT 10";
    
    $underutilStmt = $conn->prepare($underutilQuery);
    $underutilStmt->execute();
    $underutilized = $underutilStmt->fetchAll(PDO::FETCH_ASSOC);

    // Generate recommendations
    $recommendations = [];
    
    foreach ($demand as $cat) {
        if ($cat['avg_usage_per_unit'] > 20 && $cat['current_count'] < 5) {
            $recommendations[] = [
                'type' => 'High-Demand Category',
                'category' => $cat['category'],
                'reason' => "High usage rate ({$cat['avg_usage_per_unit']} uses/unit). Consider adding more equipment.",
                'current_equipment' => $cat['current_count'],
                'total_usages' => $cat['total_usages'],
                'estimated_cost' => $cat['avg_price'],
                'priority' => 'High'
            ];
        }
    }

    foreach ($waitTimes as $eq) {
        if ($eq['pending_percentage'] > 30) {
            $recommendations[] = [
                'type' => 'High-Demand Equipment',
                'equipment' => $eq['name'],
                'category' => $eq['category'],
                'reason' => "High wait rate ({$eq['pending_percentage']}% pending). Equipment is in high demand.",
                'pending_bookings' => $eq['pending_bookings'],
                'total_bookings' => $eq['total_bookings'],
                'priority' => 'High'
            ];
        }
    }

    foreach ($underutilized as $eq) {
        $recommendations[] = [
            'type' => 'Underutilized Equipment',
            'equipment' => $eq['name'],
            'category' => $eq['category'],
            'reason' => "Low usage (" . ($eq['total_usages'] ?? 0) . " uses). Not recently used.",
            'total_usages' => $eq['total_usages'],
            'days_since_use' => $eq['days_since_use'],
            'cost_per_use' => $eq['cost_per_use'],
            'recommendation' => 'Consider replacement or removal',
            'priority' => 'Medium'
        ];
    }

    echo json_encode([
        "recommendations" => $recommendations,
        "demand_analysis" => $demand,
        "high_wait_equipment" => $waitTimes,
        "underutilized_equipment" => $underutilized
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
