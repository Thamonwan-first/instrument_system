<?php
// api/staff/send_notification.php
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$type = $_POST['type'] ?? 'info'; // 'to_student', 'to_staff', 'to_admin'
$title = $_POST['title'] ?? null;
$message = $_POST['message'] ?? null;
$user_ids = $_POST['user_ids'] ?? null; // JSON array or comma-separated

if (!$title || !$message) {
    http_response_code(400);
    echo json_encode(["error" => "Title and message required"]);
    exit;
}

try {
    // Parse user IDs
    $recipients = [];
    if ($user_ids) {
        if (strpos($user_ids, '[') === 0) {
            // JSON array
            $recipients = json_decode($user_ids, true);
        } else {
            // Comma-separated
            $recipients = array_map('trim', explode(',', $user_ids));
        }
    }

    // If sending to role-based users
    if ($type !== 'custom' && empty($recipients)) {
        $query = "SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = ?)";
        
        if ($type === 'to_student') {
            $stmt = $conn->prepare($query);
            $stmt->execute(['student']);
        } elseif ($type === 'to_staff') {
            $stmt = $conn->prepare($query);
            $stmt->execute(['staff']);
        } elseif ($type === 'to_admin') {
            $stmt = $conn->prepare($query);
            $stmt->execute(['admin']);
        }
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $recipients = array_column($results, 'id');
    }

    if (empty($recipients)) {
        http_response_code(400);
        echo json_encode(["error" => "No recipients found"]);
        exit;
    }

    // Insert notifications
    $insertQuery = "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'info')";
    $insertStmt = $conn->prepare($insertQuery);

    $count = 0;
    foreach ($recipients as $user_id) {
        if ($insertStmt->execute([$user_id, $title, $message])) {
            $count++;
        }
    }

    echo json_encode([
        "message" => "Notifications sent successfully",
        "count" => $count,
        "recipients" => count($recipients)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to send notifications: " . $e->getMessage()]);
}
?>
