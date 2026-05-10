<?php
// api/staff/get_buildings.php
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$query = "SELECT id, code, name FROM buildings WHERE is_active = 1 ORDER BY name";
$stmt = $GLOBALS['conn']->prepare($query);
$stmt->execute();
$buildings = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($buildings);
?>
