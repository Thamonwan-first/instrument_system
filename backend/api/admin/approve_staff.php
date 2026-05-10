<?php
// api/admin/approve_staff.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$approval_id = $_POST['approval_id'] ?? null;
$action = $_POST['action'] ?? null; // approve, reject
$rejection_reason = $_POST['reason'] ?? null;
$admin_id = $_POST['admin_id'] ?? null;

if (!$approval_id || !$action || !$admin_id) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

if (!in_array($action, ['approve', 'reject'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid action"]);
    exit;
}

try {
    $conn->beginTransaction();

    // Get approval record
    $query = "SELECT * FROM staff_approvals WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$approval_id]);
    $approval = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$approval) {
        http_response_code(404);
        echo json_encode(["error" => "Approval not found"]);
        exit;
    }

    $user_id = $approval['user_id'];
    $status = $action === 'approve' ? 'approved' : 'rejected';

    // Update staff_approvals
    $updateQuery = "UPDATE staff_approvals 
                    SET status = ?, 
                        approved_by = ?,
                        approved_at = NOW(),
                        rejection_reason = ?
                    WHERE id = ?";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->execute([$status, $admin_id, $rejection_reason, $approval_id]);

    // If approved, update user's is_active
    if ($action === 'approve') {
        $userQuery = "UPDATE users SET is_active = 1 WHERE id = ?";
        $userStmt = $conn->prepare($userQuery);
        $userStmt->execute([$user_id]);
    }

    // Log the action
    $logQuery = "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description) 
                 VALUES (?, ?, 'staff_approval', ?, ?)";
    $logStmt = $conn->prepare($logQuery);
    $desc = "Staff approval " . ($action === 'approve' ? 'approved' : 'rejected') . " for user ID: " . $user_id;
    $logStmt->execute([$admin_id, $action . '_staff', $user_id, $desc]);

    $conn->commit();

    echo json_encode([
        "message" => "Staff " . ($action === 'approve' ? 'approved' : 'rejected') . " successfully",
        "status" => $status
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
