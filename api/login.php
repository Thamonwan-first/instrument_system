<?php
// instrument_system/api/login.php
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $userModel = new User($conn);
    $user = $userModel->findByUsername($data->username);

    if ($user && password_verify($data->password, $user['password'])) {
        unset($user['password']); 
        http_response_code(200);
        echo json_encode([
            "message" => "Login successful.",
            "user" => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Invalid username or password."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
?>