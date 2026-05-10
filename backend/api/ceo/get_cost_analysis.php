<?php
// api/ceo/get_cost_analysis.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$building_id = $_GET['building_id'] ?? null;

try {
    $query = "SELECT 
                e.id, e.name, e.code, e.price,
                e.status,
                COUNT(ul.id) as usage_count,
                COUNT(DISTINCT ul.user_id) as unique_users,
                SUM(ul.duration_min)/60 as total_hours,
                CAST(e.price AS DECIMAL(10,2)) / (COUNT(ul.id) + 1) as cost_per_use,
                DATE_FORMAT(MAX(ul.check_in), '%Y-%m-%d') as last_used,
                DATEDIFF(NOW(), MAX(ul.check_in)) as days_since_last_use
              FROM equipment e
              LEFT JOIN usage_logs ul ON e.id = ul.equipment_id";
    
    if ($building_id) {
        $query .= " LEFT JOIN rooms r ON e.room_id = r.id WHERE r.building_id = ?";
    }
    
    $query .= " GROUP BY e.id ORDER BY cost_per_use ASC";
    
    $stmt = $conn->prepare($query);
    if ($building_id) {
        $stmt->execute([$building_id]);
    } else {
        $stmt->execute();
    }
    
    $equipment = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate efficiency score for each
    $analysis = array_map(function($eq) {
        $roi_score = 0;
        if ($eq['usage_count'] > 100) $roi_score += 3;
        elseif ($eq['usage_count'] > 50) $roi_score += 2;
        elseif ($eq['usage_count'] > 10) $roi_score += 1;
        
        if ($eq['unique_users'] > 20) $roi_score += 3;
        elseif ($eq['unique_users'] > 10) $roi_score += 2;
        
        if ($eq['cost_per_use'] < 100) $roi_score += 3;
        elseif ($eq['cost_per_use'] < 500) $roi_score += 2;
        
        if ($eq['status'] == 'available') $roi_score += 1;
        if ($eq['status'] == 'retired') $roi_score = 0;
        
        return array_merge($eq, [
            'roi_score' => $roi_score,
            'recommendation' => $roi_score >= 7 ? 'High ROI - Keep' : 
                               ($roi_score >= 4 ? 'Moderate - Monitor' : 'Low ROI - Consider Replacement')
        ]);
    }, $equipment);

    echo json_encode([
        "analysis" => $analysis,
        "total_investment" => array_sum(array_map(fn($e) => $e['price'], $analysis)),
        "equipment_count" => count($analysis),
        "avg_cost_per_use" => array_sum(array_map(fn($e) => $e['cost_per_use'], $analysis)) / count($analysis)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
