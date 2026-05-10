<?php
// api/student/booking.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../controllers/BookingController.php';

$bookingController = new BookingController($conn);
$bookingController->handleRequest();
?>
