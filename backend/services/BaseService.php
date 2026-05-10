<?php
// backend/services/BaseService.php

class BaseService {
    protected $conn;

    public function __construct($db) {
        $this->conn = $db;
    }
}
?>