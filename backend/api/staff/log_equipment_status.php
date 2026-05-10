<?php
// api/staff/log_equipment_status.php
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$equipment_id = $_POST['equipment_id'] ?? null;
$new_status = $_POST['new_status'] ?? null;
$reason = $_POST['reason'] ?? null;
$notes = $_POST['notes'] ?? null;

session_start();
$user_id = $_SESSION['user_id'] ?? null;

if (!$equipment_id || !$new_status) {
    http_response_code(400);
    echo json_encode(["error" => "equipment_id and new_status required"]);
    exit;
}

try {
    // Get current equipment status
    $equipQuery = "SELECT status FROM equipment WHERE id = ?";
    $equipStmt = $conn->prepare($equipQuery);
    $equipStmt->execute([$equipment_id]);
    $equipment = $equipStmt->fetch(PDO::FETCH_ASSOC);

    if (!$equipment) {
        http_response_code(404);
        echo json_encode(["error" => "Equipment not found"]);
        exit;
    }

    $old_status = $equipment['status'];

    // Insert into history (only if status changed)
    if ($old_status !== $new_status) {
        $historyQuery = "INSERT INTO equipment_status_history 
                        (equipment_id, old_status, new_status, changed_by, reason, notes) 
                        VALUES (?, ?, ?, ?, ?, ?)";
        $historyStmt = $conn->prepare($historyQuery);
        $historyStmt->execute([$equipment_id, $old_status, $new_status, $user_id, $reason, $notes]);

        // Update equipment status
        $updateQuery = "UPDATE equipment SET status = ? WHERE id = ?";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->execute([$new_status, $equipment_id]);

        echo json_encode([
            "message" => "Status updated successfully",
            "old_status" => $old_status,
            "new_status" => $new_status,
            "timestamp" => date('Y-m-d H:i:s')
        ]);
    } else {
        echo json_encode(["message" => "No status change"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update status: " . $e->getMessage()]);
}
?>
