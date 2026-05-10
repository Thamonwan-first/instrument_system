<?php
// backend/controllers/BookingController.php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/BookingService.php';

class BookingController extends BaseController {
    private $bookingService;

    public function __construct($db) {
        parent::__construct($db);
        $this->bookingService = new BookingService($db);
    }

    public function handleRequest() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->createBooking();
        } else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $this->getBookings();
        } else {
            $this->error("Method not allowed", 405);
        }
    }

    private function createBooking() {
        $data = $this->getJSONInput();
        $user_id = $data->user_id ?? 0;
        $instrument_id = $data->equipment_id ?? $data->instrument_id ?? 0;
        $start_time = $data->start_time ?? $data->start_date ?? '';
        $end_time = $data->end_time ?? $data->end_date ?? '';

        if ($user_id && $instrument_id && $start_time && $end_time) {
            try {
                $bookingData = [
                    'user_id' => $user_id,
                    'equipment_id' => $instrument_id,
                    'start_time' => $start_time,
                    'end_time' => $end_time
                ];

                $result = $this->bookingService->createBooking($bookingData);

                if ($result['status'] === 'success') {
                    $this->success($result['message']);
                } else {
                    $this->error($result['message']);
                }
            } catch (Exception $e) {
                $this->error("เกิดข้อผิดพลาด: " . $e->getMessage(), 500);
            }
        } else {
            $this->error("ข้อมูลไม่ครบถ้วน");
        }
    }

    private function getBookings() {
        $instrument_id = $_GET['equipment_id'] ?? $_GET['instrument_id'] ?? 0;
        $user_id = $_GET['user_id'] ?? 0;

        try {
            if ($instrument_id) {
                $bookings = $this->bookingService->getBookingsByInstrument($instrument_id);
                $this->response($bookings);
            } else if ($user_id) {
                $bookings = $this->bookingService->getBookingsByUser($user_id);
                $this->response($bookings);
            } else {
                $this->error("กรุณาระบุรหัสอุปกรณ์หรือรหัสผู้ใช้งาน");
            }
        } catch (Exception $e) {
            $this->error("เกิดข้อผิดพลาด: " . $e->getMessage(), 500);
        }
    }
}
?>