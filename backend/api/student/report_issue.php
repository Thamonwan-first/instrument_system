<?php
// api/student/report_issue.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? null;
    $equipment_id = $_POST['equipment_id'] ?? null;
    $title = $_POST['title'] ?? 'แจ้งซ่อม';
    $description = $_POST['description'] ?? null;
    $severity = $_POST['severity'] ?? 'medium';

    if (!$user_id || !$equipment_id || !$description) {
        http_response_code(400);
        echo json_encode(["error" => "user_id, equipment_id, and description are required"]);
        exit;
    }

    $image_path = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $target_dir = __DIR__ . '/../../uploads/images/';
        
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0755, true);
        }
        
        $filename = 'repair_' . time() . '_' . uniqid() . '.' . $ext;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_dir . $filename)) {
            $image_path = 'backend/uploads/images/' . $filename;
        }
    }

    try {
        $query = "INSERT INTO repair_reports (equipment_id, reported_by, title, description, severity, status) 
                  VALUES (?, ?, ?, ?, ?, 'open')";
        $stmt = $conn->prepare($query);
        
        if ($stmt->execute([$equipment_id, $user_id, $title, $description, $severity])) {
            $report_id = $conn->lastInsertId();
            
            if ($image_path) {
                $imgQuery = "INSERT INTO repair_images (report_id, file_path) VALUES (?, ?)";
                $imgStmt = $conn->prepare($imgQuery);
                $imgStmt->execute([$report_id, $image_path]);
            }

            echo json_encode([
                "message" => "แจ้งซ่อมสำเร็จ! เจ้าหน้าที่จะรีบดำเนินการ",
                "report_id" => $report_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create report"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} 
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = $_GET['user_id'] ?? null;
    
    if ($user_id) {
        $query = "SELECT rr.*, e.name as equipment_name, COUNT(ri.id) as image_count
                  FROM repair_reports rr
                  JOIN equipment e ON rr.equipment_id = e.id
                  LEFT JOIN repair_images ri ON rr.id = ri.report_id
                  WHERE rr.reported_by = ?
                  GROUP BY rr.id
                  ORDER BY rr.created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute([$user_id]);
        
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}
?>
