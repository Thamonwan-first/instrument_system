<?php
// backend/config.sample.php
// Copy this file to config.php and fill in your database credentials

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = '127.0.0.1';
$db_name = 'instrument_usage';
$username = 'root'; 
$password = ''; 

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name};charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection error: " . $exception->getMessage()]);
    exit();
}
?>