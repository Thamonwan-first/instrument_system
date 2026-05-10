<?php
// backend/controllers/AuthController.php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/AuthService.php';

class AuthController extends BaseController {
    private $authService;

    public function __construct($db) {
        parent::__construct($db);
        $this->authService = new AuthService($db);
    }
    
    public function login() {
        $data = $this->getJSONInput();

        if (empty($data->username) || empty($data->password)) {
            $this->error("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
        }

        $result = $this->authService->login($data->username, $data->password);
        
        if ($result['status'] === 'success') {
            $this->success($result['message'], ['user' => $result['user']]);
        } else {
            $this->error($result['message'], $result['code'] ?? 400);
        }
    }

    public function register() {
        $data = $this->getJSONInput();

        if (
            empty($data->username) || 
            empty($data->email) || 
            empty($data->password) ||
            empty($data->first_name) ||
            empty($data->last_name) ||
            empty($data->student_id)
        ) {
            $this->error("กรุณากรอกข้อมูลให้ครบถ้วน");
        }

        $result = $this->authService->register((array)$data);

        if ($result['status'] === 'success') {
            $this->success($result['message'], null, $result['code']);
        } else {
            $this->error($result['message'], $result['code'] ?? 400);
        }
    }

    public function logout() {
        $result = $this->authService->logout();
        $this->success($result['message']);
    }
}
?>