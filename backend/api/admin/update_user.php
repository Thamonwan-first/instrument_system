<?php
// api/admin/update_user.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->role)) {
    // Get role_id
    $stmtRole = $conn->prepare("SELECT id FROM roles WHERE name = ?");
    $stmtRole->execute([$data->role]);
    $role = $stmtRole->fetch(PDO::FETCH_ASSOC);
    $role_id = $role ? $role['id'] : 3;

    $query = "UPDATE users SET 
                first_name = ?, 
                last_name = ?, 
                email = ?, 
                role_id = ?, 
                phone = ?, 
                student_id = ? 
              WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if ($stmt->execute([
        $data->first_name,
        $data->last_name,
        $data->email,
        $role_id,
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
