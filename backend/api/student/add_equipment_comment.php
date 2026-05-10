<?php
// api/student/add_equipment_comment.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$user_id = $_POST['user_id'] ?? null;
$equipment_id = $_POST['equipment_id'] ?? null;
$rating = $_POST['rating'] ?? 5;
$comment = $_POST['comment'] ?? null;

if (!$user_id || !$equipment_id) {
    http_response_code(400);
    echo json_encode(["error" => "user_id and equipment_id required"]);
    exit;
}

if ($rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(["error" => "rating must be 1-5"]);
    exit;
}

try {
    // Check if user already commented
    $checkQuery = "SELECT id FROM equipment_comments 
                   WHERE user_id = ? AND equipment_id = ? AND is_active = 1";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->execute([$user_id, $equipment_id]);
    
    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode(["error" => "You already commented on this equipment"]);
        exit;
    }

    $query = "INSERT INTO equipment_comments (user_id, equipment_id, rating, comment, is_active) 
              VALUES (?, ?, ?, ?, 1)";
    $stmt = $conn->prepare($query);
    
    if ($stmt->execute([$user_id, $equipment_id, $rating, $comment])) {
        echo json_encode([
            "message" => "ความเห็นบันทึกสำเร็จ",
            "comment_id" => $conn->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create comment"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
