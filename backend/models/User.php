<?php
// backend/models/User.php

class User {
    private $conn;
    private $table = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function findByUsernameOrEmail($username, $email) {
        $query = "SELECT id FROM " . $this->table . " WHERE username = ? OR email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$username, $email]);
        return $stmt;
    }

    public function findByLogin($username) {
        // Find by username or student_id or email
        $query = "SELECT u.*, r.name as role 
                  FROM " . $this->table . " u
                  JOIN roles r ON u.role_id = r.id
                  WHERE u.username = ? OR u.student_id = ? OR u.email = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$username, $username, $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateLastLogin($id) {
        $query = "UPDATE " . $this->table . " SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function create($data) {
        $stmtRole = $this->conn->prepare("SELECT id FROM roles WHERE name = ?");
        $stmtRole->execute([$data['role'] ?? 'student']);
        $role = $stmtRole->fetch(PDO::FETCH_ASSOC);
        $role_id = $role ? $role['id'] : 3;

        $query = "INSERT INTO " . $this->table . " 
                  (role_id, username, student_id, first_name, last_name, email, phone, password_hash, faculty, department) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute([
            $role_id,
            $data['username'],
            $data['student_id'] ?? null,
            $data['first_name'],
            $data['last_name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['password_hash'],
            $data['faculty'] ?? null,
            $data['department'] ?? null
        ]);
    }
}
?>