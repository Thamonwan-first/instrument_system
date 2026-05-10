<?php
// backend/controllers/BaseController.php

class BaseController {
    protected $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * รับข้อมูล JSON จาก Request Body
     */
    protected function getJSONInput() {
        return json_decode(file_get_contents("php://input"));
    }

    /**
     * ส่งข้อมูล JSON Response
     */
    protected function response($data, $code = 200) {
        http_response_code($code);
        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode($data);
        exit();
    }

    /**
     * ส่งข้อความ Error JSON Response
     */
    protected function error($message, $code = 400) {
        $this->response([
            "status" => "error",
            "message" => $message
        ], $code);
    }

    /**
     * ส่งข้อความ Success JSON Response
     */
    protected function success($message, $data = null, $code = 200) {
        $response = [
            "status" => "success",
            "message" => $message
        ];
        if ($data) {
            $response = array_merge($response, $data);
        }
        $this->response($response, $code);
    }
}
?>