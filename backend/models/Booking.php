<?php
// backend/models/Booking.php

class Booking {
    private $conn;
    private $table = "bookings";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function checkOverlap($instrument_id, $start_time, $end_time) {
        $query = "SELECT id FROM " . $this->table . " 
                  WHERE equipment_id = ? 
                  AND status NOT IN ('cancelled', 'rejected')
                  AND (
                      (start_time <= ? AND end_time >= ?) OR 
                      (start_time <= ? AND end_time >= ?) OR
                      (? <= start_time AND ? >= end_time)
                  )";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$instrument_id, $start_time, $start_time, $end_time, $end_time, $start_time, $end_time]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table . " (user_id, equipment_id, start_time, end_time, status) VALUES (?, ?, ?, ?, 'pending')";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['user_id'],
            $data['equipment_id'],
            $data['start_time'],
            $data['end_time']
        ]);
    }

    public function getByInstrument($instrument_id) {
        $query = "SELECT b.*, u.first_name, u.last_name 
                  FROM " . $this->table . " b 
                  JOIN users u ON b.user_id = u.id 
                  WHERE b.equipment_id = ? AND b.status != 'cancelled'
                  ORDER BY b.start_time ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$instrument_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByUser($user_id) {
        $query = "SELECT b.*, e.name as instrument_name 
                  FROM " . $this->table . " b 
                  JOIN equipment e ON b.equipment_id = e.id 
                  WHERE b.user_id = ? 
                  ORDER BY b.start_time DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>