<?php
// api/common/mark_notification_read.php
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$notification_id = $_POST['id'] ?? null;
$mark_all = $_POST['mark_all'] ?? false;

session_start();
$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["error" => "User not authenticated"]);
    exit;
}

try {
    if ($mark_all) {
        $query = "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0";
        $stmt = $conn->prepare($query);
        $stmt->execute([$user_id]);
    } else {
        if (!$notification_id) {
            http_response_code(400);
            echo json_encode(["error" => "Notification ID required"]);
            exit;
        }
        
        $query = "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$notification_id, $user_id]);
    }

    echo json_encode(["message" => "Notification marked as read"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update notification"]);
}
?>
