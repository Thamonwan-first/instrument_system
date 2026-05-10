<?php
// backend/models/Instrument.php (Now handling 'equipment' table)

class Instrument {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getFullTree() {
        // Using the view v_equipment_full from the new schema
        $query = "SELECT 
                    building_id as b_id, building_name as b_name,
                    room_id as r_id, room_number as r_name,
                    id as i_id, name as i_name, status as i_status, purchase_price as i_price,
                    qr_token as i_qr
                  FROM v_equipment_full
                  ORDER BY building_name, room_number, name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addBuilding($name, $code = null) {
        $code = $code ?? strtoupper(substr($name, 0, 3));
        $stmt = $this->conn->prepare("INSERT INTO buildings (name, code) VALUES (?, ?)");
        return $stmt->execute([$name, $code]);
    }

    public function addRoom($building_id, $room_number, $name = null, $floor = null, $description = null) {
        $stmt = $this->conn->prepare("INSERT INTO rooms (building_id, room_number, name, floor, description) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$building_id, $room_number, $name, $floor, $description]);
    }

    public function updateBuilding($id, $name, $code = null) {
        $code = $code ?? strtoupper(substr($name, 0, 3));
        $stmt = $this->conn->prepare("UPDATE buildings SET name = ?, code = ? WHERE id = ?");
        return $stmt->execute([$name, $code, $id]);
    }

    public function deleteBuilding($id) {
        // Check if building has rooms
        $checkQuery = "SELECT COUNT(*) as count FROM rooms WHERE building_id = ? AND is_active = 1";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            return false; // Cannot delete building with active rooms
        }

        $query = "UPDATE buildings SET is_active = 0 WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function updateRoom($id, $building_id, $room_number, $name = null, $floor = null, $description = null) {
        $stmt = $this->conn->prepare("UPDATE rooms SET building_id = ?, room_number = ?, name = ?, floor = ?, description = ? WHERE id = ?");
        return $stmt->execute([$building_id, $room_number, $name, $floor, $description, $id]);
    }

    public function deleteRoom($id) {
        // Check if room has equipment
        $checkQuery = "SELECT COUNT(*) as count FROM equipment WHERE room_id = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            return false; // Cannot delete room with equipment
        }

        $query = "UPDATE rooms SET is_active = 0 WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function getRoomById($id) {
        $query = "SELECT r.*, b.name as building_name FROM rooms r LEFT JOIN buildings b ON r.building_id = b.id WHERE r.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getBuildingById($id) {
        $query = "SELECT * FROM buildings WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function addInstrument($data) {
        $query = "INSERT INTO equipment (room_id, category_id, code, name, brand, model, purchase_price, status, description, usage_rules, qr_token, thumbnail) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        // Generate a simple qr_token if not provided
        $qr_token = $data['qr_token'] ?? bin2hex(random_bytes(16));
        $code = $data['code'] ?? 'EQ-' . time();

        return $stmt->execute([
            $data['room_id'],
            $data['category_id'] ?? null,
            $code,
            $data['name'],
            $data['brand'] ?? null,
            $data['model'] ?? null,
            $data['price'] ?? 0,
            $data['status'] ?? 'available',
            $data['description'] ?? null,
            $data['rules'] ?? null,
            $qr_token,
            $data['image_path'] ?? null
        ]);
    }

    public function getEquipmentById($id) {
        $query = "SELECT 
                    e.id, e.room_id, e.category_id, e.code, e.name, e.brand, e.model, 
                    e.serial_number, e.purchase_price, e.status, e.description, e.usage_rules, 
                    e.qr_token, e.thumbnail, e.is_bookable, e.created_at,
                    r.building_id, r.room_number, b.name as building_name
                  FROM equipment e
                  LEFT JOIN rooms r ON e.room_id = r.id
                  LEFT JOIN buildings b ON r.building_id = b.id
                  WHERE e.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateEquipment($data) {
        $query = "UPDATE equipment SET 
                    room_id = ?, category_id = ?, code = ?, name = ?, brand = ?, model = ?, 
                    serial_number = ?, purchase_price = ?, status = ?, description = ?, 
                    usage_rules = ?, is_bookable = ?";
        
        $params = [
            $data['room_id'],
            $data['category_id'],
            $data['code'],
            $data['name'],
            $data['brand'],
            $data['model'],
            $data['serial_number'] ?? null,
            $data['purchase_price'],
            $data['status'],
            $data['description'],
            $data['usage_rules'],
            $data['is_bookable'] ?? 1
        ];

        if (isset($data['image_path'])) {
            $query .= ", thumbnail = ?";
            $params[] = $data['image_path'];
        }

        $query .= " WHERE id = ?";
        $params[] = $data['id'];

        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    public function deleteEquipment($id) {
        // First check if equipment has active bookings or repairs
        $checkQuery = "SELECT COUNT(*) as count FROM bookings WHERE equipment_id = ? AND status IN ('pending', 'approved')";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            return false; // Cannot delete equipment with active bookings
        }

        $query = "DELETE FROM equipment WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function getBuildings() {
        $query = "SELECT id, code, name FROM buildings WHERE is_active = 1 ORDER BY name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRoomsByBuilding($building_id) {
        $query = "SELECT id, room_number, name FROM rooms WHERE building_id = ? AND is_active = 1 ORDER BY room_number";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$building_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function logStatusChange($equipment_id, $new_status, $old_status = null, $changed_by = null, $reason = null, $notes = null) {
        if (!$old_status) {
            $query = "SELECT status FROM equipment WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$equipment_id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $old_status = $result['status'];
        }

        if ($old_status === $new_status) {
            return false;
        }

        $historyQuery = "INSERT INTO equipment_status_history (equipment_id, old_status, new_status, changed_by, reason, notes) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($historyQuery);
        return $stmt->execute([$equipment_id, $old_status, $new_status, $changed_by, $reason, $notes]);
    }

    public function getStatusHistory($equipment_id, $limit = 50) {
        $query = "SELECT esh.id, esh.old_status, esh.new_status, esh.reason, esh.notes, esh.created_at, u.first_name, u.last_name
                  FROM equipment_status_history esh
                  LEFT JOIN users u ON esh.changed_by = u.id
                  WHERE esh.equipment_id = ?
                  ORDER BY esh.created_at DESC
                  LIMIT ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$equipment_id, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>