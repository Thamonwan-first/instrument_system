<?php
// api/common/get_tree.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../controllers/EquipmentController.php';

$equipmentController = new EquipmentController($conn);
$equipmentController->getTree();
?>
