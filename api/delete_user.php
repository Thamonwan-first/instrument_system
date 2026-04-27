<?php
// api/delete_user.php
include 'config.php';

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    // ป้องกันการลบตัวเอง (สมมติว่า admin id คือ 1 หรือส่งมาจาก session)
    // if ($data->id == $_SESSION['user_id']) { ... }

    $query = "DELETE FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if ($stmt->execute([$data->id])) {
        echo json_encode(["message" => "ลบผู้ใช้งานสำเร็จ"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "ไม่สามารถลบผู้ใช้งานได้"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ID ไม่ถูกต้อง"]);
}
?>