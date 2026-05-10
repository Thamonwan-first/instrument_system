<?php
// api/staff/report_maintenance.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? 0;
    $instrument_id = $_POST['equipment_id'] ?? $_POST['instrument_id'] ?? 0;
    $title = $_POST['title'] ?? 'แจ้งซ่อม';
    $description = $_POST['description'] ?? '';
    $severity = $_POST['severity'] ?? 'medium';
    $image_path = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $target_dir = __DIR__ . '/../../uploads/images/';
        $filename = 'repair_' . time() . '_' . uniqid() . '.' . $ext;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_dir . $filename)) {
            $image_path = 'backend/uploads/images/' . $filename;
        }
    }

    if ($user_id && $instrument_id && $description) {
        $query = "INSERT INTO repair_reports (equipment_id, reported_by, title, description, severity, status) VALUES (?, ?, ?, ?, ?, 'open')";
        $stmt = $conn->prepare($query);
        if ($stmt->execute([$instrument_id, $user_id, $title, $description, $severity])) {
            $report_id = $conn->lastInsertId();
            if ($image_path) {
                $stmtImg = $conn->prepare("INSERT INTO repair_images (report_id, file_path) VALUES (?, ?)");
                $stmtImg->execute([$report_id, $image_path]);
            }
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
    // ใช้ View v_open_repairs สำหรับรายการที่ยังไม่เสร็จ
    $query = "SELECT * FROM v_open_repairs ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>
