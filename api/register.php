<?php
// instrument_system/api/register.php
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password) && !empty($data->email)) {
    $userModel = new User($conn);
    $checkUser = $userModel->findByUsernameOrEmail($data->username, $data->email);

    if ($checkUser->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["message" => "Username or Email already exists."]);
    } else {
        $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
        
        $userData = [
            'username' => $data->username,
            'password' => $hashedPassword,
            'first_name' => $data->first_name,
            'last_name' => $data->last_name,
            'student_id' => $data->student_id ?? null,
            'phone' => $data->phone ?? null,
            'email' => $data->email,
            'role' => $data->role ?? 'student'
        ];

        if ($userModel->create($userData)) {
            http_response_code(201);
            echo json_encode(["message" => "User registered successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Unable to register user."]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
?>