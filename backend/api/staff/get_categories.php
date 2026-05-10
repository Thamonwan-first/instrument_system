<?php
// api/staff/get_categories.php
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$query = "SELECT id, name FROM equipment_categories ORDER BY name";
$stmt = $GLOBALS['conn']->prepare($query);
$stmt->execute();
$categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($categories);
?>
