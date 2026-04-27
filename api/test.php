<?php
header("Access-Control-Allow-Origin: *");
echo json_encode(["status" => "ok", "message" => "Connection to PHP API is working!"]);
?>