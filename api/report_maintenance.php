<?php
// api/report_maintenance.php
include 'config.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? 0;
    $instrument_id = $_POST['instrument_id'] ?? 0;
    $description = $_POST['description'] ?? '';
    $image_path = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = 'repair_' . time() . '_' . uniqid() . '.' . $ext;
        if (move_uploaded_file($_FILES['image']['tmp_name'], 'uploads/images/' . $filename)) {
            $image_path = $filename;
        }
    }

    if ($user_id && $instrument_id && $description) {
        $query = "INSERT INTO maintenance (instrument_id, reported_by, description, image_path, status) VALUES (?, ?, ?, ?, 'pending')";
        $stmt = $conn->prepare($query);
        if ($stmt->execute([$instrument_id, $user_id, $description, $image_path])) {
            echo json_encode(["message" => "แจ้งซ่อมสำเร็จ เจ้าหน้าที่จะรีบดำเนินการ"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "ไม่สามารถบันทึกข้อมูลได้"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "กรุณากรอกรายละเอียดให้ครบถ้วน"]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // สำหรับ Staff ดูรายการแจ้งซ่อมทั้งหมด
    $query = "SELECT m.*, i.name as instrument_name, u.first_name, u.last_name 
              FROM maintenance m
              JOIN instruments i ON m.instrument_id = i.id
              JOIN users u ON m.reported_by = u.id
              ORDER BY m.created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>