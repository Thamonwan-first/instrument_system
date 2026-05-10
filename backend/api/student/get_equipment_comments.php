<?php
// api/student/get_equipment_comments.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

$equipment_id = $_GET['equipment_id'] ?? null;

if (!$equipment_id) {
    http_response_code(400);
    echo json_encode(["error" => "equipment_id required"]);
    exit;
}

try {
    $query = "SELECT c.id, c.rating, c.comment, c.created_at, 
                     u.first_name, u.last_name, u.student_id
              FROM equipment_comments c
              JOIN users u ON c.user_id = u.id
              WHERE c.equipment_id = ? AND c.is_active = 1
              ORDER BY c.created_at DESC
              LIMIT 50";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$equipment_id]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate average rating
    $ratingQuery = "SELECT AVG(rating) as avg_rating, COUNT(*) as count 
                    FROM equipment_comments 
                    WHERE equipment_id = ? AND is_active = 1";
    $ratingStmt = $conn->prepare($ratingQuery);
    $ratingStmt->execute([$equipment_id]);
    $rating = $ratingStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "equipment_id" => $equipment_id,
        "comments" => $comments,
        "rating" => $rating
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch comments"]);
}
?>
