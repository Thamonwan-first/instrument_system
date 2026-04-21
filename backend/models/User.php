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

    public function findByUsername($username) {
        $query = "SELECT * FROM " . $this->table . " WHERE username = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  (username, password, first_name, last_name, student_id, phone, email, role) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute([
            $data['username'],
            $data['password'],
            $data['first_name'],
            $data['last_name'],
            $data['student_id'],
            $data['phone'],
            $data['email'],
            $data['role']
        ]);
    }
}
?>