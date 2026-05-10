<?php
// api/staff/add_item.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../controllers/EquipmentController.php';

$equipmentController = new EquipmentController($conn);
$equipmentController->addItem();
?>
