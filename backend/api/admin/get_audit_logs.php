<?php
// api/admin/get_audit_logs.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$limit = $_GET['limit'] ?? 100;
$offset = $_GET['offset'] ?? 0;
$action = $_GET['action'] ?? null;
$user_id = $_GET['user_id'] ?? null;
$date_from = $_GET['from'] ?? null;
$date_to = $_GET['to'] ?? null;

$query = "SELECT al.*, u.first_name, u.last_name, u.username 
          FROM audit_logs al
          LEFT JOIN users u ON al.user_id = u.id
          WHERE 1=1";

$params = [];

if ($action) {
    $query .= " AND al.action = ?";
    $params[] = $action;
}

if ($user_id) {
    $query .= " AND al.user_id = ?";
    $params[] = $user_id;
}

if ($date_from) {
    $query .= " AND DATE(al.created_at) >= ?";
    $params[] = $date_from;
}

if ($date_to) {
    $query .= " AND DATE(al.created_at) <= ?";
    $params[] = $date_to;
}

$query .= " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;

try {
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM audit_logs WHERE 1=1";
    if ($action) $countQuery .= " AND action = '$action'";
    if ($user_id) $countQuery .= " AND user_id = $user_id";
    if ($date_from) $countQuery .= " AND DATE(created_at) >= '$date_from'";
    if ($date_to) $countQuery .= " AND DATE(created_at) <= '$date_to'";
    
    $countStmt = $conn->prepare($countQuery);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        "logs" => $logs,
        "total" => $total,
        "limit" => $limit,
        "offset" => $offset
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
