<?php
// backend/services/EquipmentService.php

require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../models/Instrument.php';

class EquipmentService extends BaseService {
    private $instrumentModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->instrumentModel = new Instrument($db);
    }

    public function getTree() {
        return $this->instrumentModel->getFullTree();
    }

    public function getDetails($id) {
        return $this->instrumentModel->getInstrumentById($id);
    }

    public function addBuilding($name) {
        if (empty($name)) return false;
        return $this->instrumentModel->addBuilding($name);
    }

    public function addRoom($building_id, $name) {
        if (empty($building_id) || empty($name)) return false;
        return $this->instrumentModel->addRoom($building_id, $name);
    }

    public function addInstrument($data) {
        if (empty($data['room_id']) || empty($data['name'])) return false;
        return $this->instrumentModel->addInstrument($data);
    }
}
?>