<?php
// api/update_user.php
include 'config.php';

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->role)) {
    $query = "UPDATE users SET 
                first_name = ?, 
                last_name = ?, 
                email = ?, 
                role = ?, 
                phone = ?, 
                student_id = ? 
              WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if ($stmt->execute([
        $data->first_name,
        $data->last_name,
        $data->email,
        $data->role,
        $data->phone ?? null,
        $data->student_id ?? null,
        $data->id
    ])) {
        echo json_encode(["message" => "อัปเดตข้อมูลผู้ใช้งานสำเร็จ"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "ไม่สามารถอัปเดตข้อมูลได้"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ข้อมูลไม่ครบถ้วน"]);
}
?>