<?php
// backend/services/AuthService.php

require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../models/User.php';

class AuthService extends BaseService {
    private $userModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->userModel = new User($db);
    }

    public function login($username, $password) {
        $user = $this->userModel->findByLogin($username);

        if (!$user) {
            return ['status' => 'error', 'message' => 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง', 'code' => 401];
        }

        if ($user['is_active'] == 0) {
            return ['status' => 'error', 'message' => 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ', 'code' => 403];
        }

        if (password_verify($password, $user['password_hash'])) {
            $this->userModel->updateLastLogin($user['id']);
            unset($user['password_hash']);

            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];

            return ['status' => 'success', 'message' => 'เข้าสู่ระบบสำเร็จ', 'user' => $user];
        }

        return ['status' => 'error', 'message' => 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง', 'code' => 401];
    }

    public function register($data) {
        $checkUser = $this->userModel->findByUsernameOrEmail($data['username'], $data['email']);

        if ($checkUser->rowCount() > 0) {
            return ['status' => 'error', 'message' => 'ชื่อผู้ใช้งาน, อีเมล หรือรหัสนักศึกษานี้ถูกใช้งานไปแล้ว', 'code' => 400];
        }

        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $userData = [
            'username' => $data['username'],
            'student_id' => $data['student_id'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password_hash' => $hashedPassword,
            'role' => $data['role'] ?? 'student',
            'faculty' => $data['faculty'] ?? null,
            'department' => $data['department'] ?? null
        ];

        if ($this->userModel->create($userData)) {
            return ['status' => 'success', 'message' => 'ลงทะเบียนสำเร็จ', 'code' => 201];
        }

        return ['status' => 'error', 'message' => 'ไม่สามารถลงทะเบียนได้ในขณะนี้', 'code' => 500];
    }

    public function logout() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_destroy();
        return ['status' => 'success', 'message' => 'ออกจากระบบสำเร็จ'];
    }
}
?>