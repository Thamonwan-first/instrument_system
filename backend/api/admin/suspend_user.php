<?php
// api/admin/suspend_user.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$user_id = $_POST['user_id'] ?? null;
$action = $_POST['action'] ?? null; // suspend, unsuspend
$reason = $_POST['reason'] ?? null;
$admin_id = $_POST['admin_id'] ?? null;

if (!$user_id || !$action || !$admin_id) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

if (!in_array($action, ['suspend', 'unsuspend'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid action"]);
    exit;
}

try {
    $conn->beginTransaction();

    if ($action === 'suspend') {
        // Check if already suspended
        $checkQuery = "SELECT id FROM user_suspensions WHERE user_id = ? AND is_active = 1";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->execute([$user_id]);
        
        if ($checkStmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "User is already suspended"]);
            exit;
        }

        // Insert suspension record
        $suspendQuery = "INSERT INTO user_suspensions (user_id, suspended_by, reason, is_active) 
                         VALUES (?, ?, ?, 1)";
        $suspendStmt = $conn->prepare($suspendQuery);
        $suspendStmt->execute([$user_id, $admin_id, $reason]);

        // Update user is_active
        $userQuery = "UPDATE users SET is_active = 0 WHERE id = ?";
        $userStmt = $conn->prepare($userQuery);
        $userStmt->execute([$user_id]);

    } else {
        // Unsuspend
        $unsuspendQuery = "UPDATE user_suspensions 
                           SET is_active = 0, unsuspended_at = NOW()
                           WHERE user_id = ? AND is_active = 1";
        $unsuspendStmt = $conn->prepare($unsuspendQuery);
        $unsuspendStmt->execute([$user_id]);

        // Update user is_active
        $userQuery = "UPDATE users SET is_active = 1 WHERE id = ?";
        $userStmt = $conn->prepare($userQuery);
        $userStmt->execute([$user_id]);
    }

    // Log action
    $logQuery = "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description) 
                 VALUES (?, ?, 'user_suspension', ?, ?)";
    $logStmt = $conn->prepare($logQuery);
    $desc = "User " . ($action === 'suspend' ? 'suspended' : 'unsuspended') . " with reason: " . $reason;
    $logStmt->execute([$admin_id, $action . '_user', $user_id, $desc]);

    $conn->commit();

    echo json_encode([
        "message" => "User " . ($action === 'suspend' ? 'suspended' : 'unsuspended') . " successfully"
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
