<?php
// api/admin/get_users.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../controllers/AdminController.php';

$adminController = new AdminController($conn);
$adminController->getUsers();
?>
