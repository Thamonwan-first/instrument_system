<?php
// api/staff/get_equipment_status_history.php
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$equipment_id = $_GET['equipment_id'] ?? null;
$limit = $_GET['limit'] ?? 50;

if (!$equipment_id) {
    http_response_code(400);
    echo json_encode(["error" => "equipment_id required"]);
    exit;
}

try {
    $query = "SELECT 
                esh.id, esh.old_status, esh.new_status, esh.reason, esh.notes, esh.created_at,
                u.first_name, u.last_name
              FROM equipment_status_history esh
              LEFT JOIN users u ON esh.changed_by = u.id
              WHERE esh.equipment_id = ?
              ORDER BY esh.created_at DESC
              LIMIT ?";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$equipment_id, $limit]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "equipment_id" => $equipment_id,
        "history" => $history,
        "total" => count($history)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch status history"]);
}
?>
