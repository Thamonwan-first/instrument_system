<?php
// api/staff/resolve_maintenance.php
require_once __DIR__ . '/../../config/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $report_id = $_POST['report_id'] ?? 0;
    $status = $_POST['status'] ?? 'resolved'; // resolved, closed
    $spare_parts = $_POST['spare_parts'] ?? []; // Array of {id, quantity}

    if ($report_id) {
        $conn->beginTransaction();
        try {
            $stmt = $conn->prepare("UPDATE repair_reports SET status = ? WHERE id = ?");
            $stmt->execute([$status, $report_id]);

            if ($status === 'resolved' || $status === 'closed') {
                // If resolved, set equipment status back to available if it was in maintenance
                $stmtRep = $conn->prepare("SELECT equipment_id FROM repair_reports WHERE id = ?");
                $stmtRep->execute([$report_id]);
                $rep = $stmtRep->fetch(PDO::FETCH_ASSOC);
                if ($rep) {
                    $stmtEq = $conn->prepare("UPDATE equipment SET status = 'available' WHERE id = ?");
                    $stmtEq->execute([$rep['equipment_id']]);
                }
            }

            // Record spare parts usage
            foreach ($spare_parts as $part) {
                $part_id = $part['id'];
                $qty = $part['quantity'];

                $stmtUsage = $conn->prepare("INSERT INTO spare_part_usage (repair_id, spare_part_id, quantity) VALUES (?, ?, ?)");
                $stmtUsage->execute([$report_id, $part_id, $qty]);

                $stmtStock = $conn->prepare("UPDATE spare_parts SET quantity = quantity - ? WHERE id = ?");
                $stmtStock->execute([$qty, $part_id]);
            }

            $conn->commit();
            echo json_encode(["message" => "บันทึกการซ่อมสำเร็จ"]);
        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "เกิดข้อผิดพลาด: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "ข้อมูลไม่ครบถ้วน"]);
    }
}
?>
