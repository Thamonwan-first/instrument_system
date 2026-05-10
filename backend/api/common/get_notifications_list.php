<?php
// api/common/get_notifications_list.php
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

// Get user_id from session or request
session_start();
$user_id = $_SESSION['user_id'] ?? $_GET['user_id'] ?? null;
$limit = $_GET['limit'] ?? 20;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["error" => "User ID required"]);
    exit;
}

$query = "SELECT id, title, message, type, is_read, created_at 
          FROM notifications 
          WHERE user_id = ? 
          ORDER BY created_at DESC 
          LIMIT ?";

try {
    $stmt = $conn->prepare($query);
    $stmt->execute([$user_id, $limit]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get unread count
    $countQuery = "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0";
    $countStmt = $conn->prepare($countQuery);
    $countStmt->execute([$user_id]);
    $countResult = $countStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "notifications" => $notifications,
        "unread_count" => $countResult['count']
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch notifications"]);
}
?>
