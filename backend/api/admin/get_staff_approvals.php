<?php
// api/admin/get_staff_approvals.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$status = $_GET['status'] ?? null;

$query = "SELECT sa.*, 
                 u.id as user_id, u.username, u.first_name, u.last_name, u.email, u.phone,
                 req.first_name as requested_first, req.last_name as requested_last,
                 app.first_name as approved_first, app.last_name as approved_last
          FROM staff_approvals sa
          JOIN users u ON sa.user_id = u.id
          JOIN users req ON sa.requested_by = req.id
          LEFT JOIN users app ON sa.approved_by = app.id";

if ($status) {
    $query .= " WHERE sa.status = ?";
    $stmt = $conn->prepare($query . " ORDER BY sa.created_at DESC");
    $stmt->execute([$status]);
} else {
    $stmt = $conn->prepare($query . " ORDER BY sa.status, sa.created_at DESC");
    $stmt->execute();
}

try {
    $approvals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($approvals);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
