<?php
// backend/controllers/AdminController.php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/User.php';

class AdminController extends BaseController {

    public function getUsers() {
        try {
            // We can add logic to the model or keep it here for now
            $query = "SELECT u.id, u.student_id, u.first_name, u.last_name, u.email, u.phone, r.name as role, u.created_at, u.is_active 
                      FROM users u 
                      JOIN roles r ON u.role_id = r.id 
                      ORDER BY r.name, u.first_name";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->response($users);
        } catch (Exception $e) {
            $this->error("เกิดข้อผิดพลาด: " . $e->getMessage(), 500);
        }
    }

    public function deleteUser() {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->error("ไม่พบรหัสผู้ใช้งาน");
        }

        try {
            $stmt = $this->conn->prepare("DELETE FROM users WHERE id = ?");
            if ($stmt->execute([$id])) {
                $this->success("ลบผู้ใช้งานสำเร็จ");
            } else {
                $this->error("ไม่สามารถลบผู้ใช้งานได้");
            }
        } catch (Exception $e) {
            $this->error("เกิดข้อผิดพลาด: " . $e->getMessage(), 500);
        }
    }
}
?>