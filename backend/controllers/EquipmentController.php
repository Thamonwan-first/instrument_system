<?php
// backend/controllers/EquipmentController.php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/EquipmentService.php';

class EquipmentController extends BaseController {
    private $equipmentService;

    public function __construct($db) {
        parent::__construct($db);
        $this->equipmentService = new EquipmentService($db);
    }

    public function getTree() {
        try {
            $tree = $this->equipmentService->getTree();
            $this->success("ดึงข้อมูลสำเร็จ", ["data" => $tree]);
        } catch (Exception $e) {
            $this->error("เกิดข้อผิดพลาด: " . $e->getMessage(), 500);
        }
    }

    public function getDetails() {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->error("ไม่พบรหัสอุปกรณ์");
        }

        try {
            $details = $this->equipmentService->getDetails($id);
            if ($details) {
                $this->success("ดึงข้อมูลสำเร็จ", ["data" => $details]);
            } else {
                $this->error("ไม่พบข้อมูลอุปกรณ์", 404);
            }
        } catch (Exception $e) {
            $this->error("เกิดข้อผิดพลาด: " . $e->getMessage(), 500);
        }
    }

    public function addItem() {
        $type = $_POST['type'] ?? '';

        try {
            if ($type == 'building') {
                $name = $_POST['name'] ?? '';
                if ($this->equipmentService->addBuilding($name)) {
                    $this->success("เพิ่มตึกสำเร็จ");
                } else {
                    $this->error("ไม่สามารถเพิ่มตึกได้");
                }
            } else if ($type == 'room') {
                $building_id = $_POST['building_id'] ?? '';
                $name = $_POST['name'] ?? '';
                if ($this->equipmentService->addRoom($building_id, $name)) {
                    $this->success("เพิ่มห้องสำเร็จ");
                } else {
                    $this->error("ไม่สามารถเพิ่มห้องได้");
                }
            } else if ($type == 'instrument') {
                $data = [
                    'room_id' => $_POST['room_id'] ?? '',
                    'name' => $_POST['name'] ?? '',
                    'description' => $_POST['description'] ?? '',
                    'price' => $_POST['price'] ?? 0,
                    'rules' => $_POST['rules'] ?? '',
                    'image_path' => null,
                    'manual_pdf' => null
                ];

                // Handle Image Upload
                if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
                    $target_dir = __DIR__ . "/../uploads/images/";
                    if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);
                    $filename = time() . "_" . $_FILES['image']['name'];
                    if (move_uploaded_file($_FILES['image']['tmp_name'], $target_dir . $filename)) {
                        $data['image_path'] = "backend/uploads/images/" . $filename;
                    }
                }

                // Handle PDF Upload
                if (isset($_FILES['manual']) && $_FILES['manual']['error'] == 0) {
                    $target_dir = __DIR__ . "/../uploads/manuals/";
                    if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);
                    $filename = time() . "_" . $_FILES['manual']['name'];
                    if (move_uploaded_file($_FILES['manual']['tmp_name'], $target_dir . $filename)) {
                        $data['manual_pdf'] = "backend/uploads/manuals/" . $filename;
                    }
                }

                if ($this->equipmentService->addInstrument($data)) {
                    $this->success("เพิ่มอุปกรณ์สำเร็จ");
                } else {
                    $this->error("ไม่สามารถเพิ่มอุปกรณ์ได้");
                }
            } else {
                $this->error("ประเภทไม่ถูกต้อง");
            }
        } catch (Exception $e) {
            $this->error("เกิดข้อผิดพลาด: " . $e->getMessage(), 500);
        }
    }
}
?>