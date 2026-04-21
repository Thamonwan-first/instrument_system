<?php
// instrument_system/api/get_tree.php
include 'config.php';

$instrumentModel = new Instrument($conn);
$results = $instrumentModel->getFullTree();

$tree = [];
foreach ($results as $row) {
    $b_id = $row['b_id'];
    if (!isset($tree[$b_id])) {
        $tree[$b_id] = [
            'id' => $b_id,
            'name' => $row['b_name'],
            'type' => 'building',
            'rooms' => []
        ];
    }

    if ($row['r_id']) {
        $r_id = $row['r_id'];
        if (!isset($tree[$b_id]['rooms'][$r_id])) {
            $tree[$b_id]['rooms'][$r_id] = [
                'id' => $r_id,
                'name' => $row['r_name'],
                'type' => 'room',
                'instruments' => []
            ];
        }

        if ($row['i_id']) {
            $tree[$b_id]['rooms'][$r_id]['instruments'][] = [
                'id' => $row['i_id'],
                'name' => $row['i_name'],
                'price' => $row['i_price'],
                'status' => $row['i_status'],
                'type' => 'instrument'
            ];
        }
    }
}

// แปลงกลับเป็น Indexed Array เพื่อให้ JSON สวยงาม
$final_tree = array_values(array_map(function($b) {
    $b['rooms'] = array_values(array_map(function($r) {
        return $r;
    }, $b['rooms']));
    return $b;
}, $tree));

echo json_encode($final_tree);
?>