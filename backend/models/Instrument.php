<?php
// backend/models/Instrument.php

class Instrument {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getFullTree() {
        $query = "SELECT b.id AS b_id, b.name AS b_name, 
                         r.id AS r_id, r.name AS r_name, 
                         i.id AS i_id, i.name AS i_name, i.status AS i_status, i.price AS i_price
                  FROM buildings b
                  LEFT JOIN rooms r ON b.id = r.building_id
                  LEFT JOIN instruments i ON r.id = i.room_id
                  ORDER BY b.name, r.name, i.name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addBuilding($name) {
        $stmt = $this->conn->prepare("INSERT INTO buildings (name) VALUES (?)");
        return $stmt->execute([$name]);
    }

    public function addRoom($building_id, $name) {
        $stmt = $this->conn->prepare("INSERT INTO rooms (building_id, name) VALUES (?, ?)");
        return $stmt->execute([$building_id, $name]);
    }

    public function addInstrument($data) {
        $query = "INSERT INTO instruments (room_id, name, description, price, image_path, manual_pdf, rules) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $data['room_id'],
            $data['name'],
            $data['description'],
            $data['price'],
            $data['image_path'],
            $data['manual_pdf'],
            $data['rules']
        ]);
    }
}
?>