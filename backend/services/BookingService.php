<?php
// backend/services/BookingService.php

require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../models/Booking.php';

class BookingService extends BaseService {
    private $bookingModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->bookingModel = new Booking($db);
    }

    public function createBooking($data) {
        if ($this->bookingModel->checkOverlap($data['equipment_id'], $data['start_time'], $data['end_time'])) {
            return ['status' => 'error', 'message' => 'ช่วงเวลาที่เลือกมีผู้ใช้งานอื่นจองไว้แล้ว'];
        }

        if ($this->bookingModel->create($data)) {
            return ['status' => 'success', 'message' => 'ส่งคำขอจองสำเร็จ! กรุณารอเจ้าหน้าที่อนุมัติ'];
        }

        return ['status' => 'error', 'message' => 'ไม่สามารถบันทึกการจองได้'];
    }

    public function getBookingsByInstrument($instrument_id) {
        return $this->bookingModel->getByInstrument($instrument_id);
    }

    public function getBookingsByUser($user_id) {
        return $this->bookingModel->getByUser($user_id);
    }
}
?>