<?php
require_once __DIR__ . '/../config/database.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = getDBConnection();

$action = $_GET['action'] ?? '';

/* ================= ADMIN REPORT ================= */
if ($action === 'exam_report' && isset($_GET['id'])) {

    $exam_id = intval($_GET['id']);

    $query = "
        SELECT 
            u.name AS student_name,
            u.gender,
            u.email AS student_email,
            e.title AS exam_title,
            e.subject,
            ea.score,
            ea.total_marks,
            ROUND((ea.score / ea.total_marks) * 100, 2) AS percentage,
            CASE 
                WHEN ea.score >= e.pass_marks THEN 'Pass'
                ELSE 'Fail'
            END AS status
        FROM exam_attempts ea
        JOIN users u ON ea.student_id = u.id
        JOIN exams e ON ea.exam_id = e.id
        WHERE ea.exam_id = $exam_id
        AND ea.status = 'completed'
        ORDER BY percentage DESC
    ";

    $result = $conn->query($query);

    if (!$result) {
        echo json_encode(["error" => $conn->error]);
        exit;
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    exit;
}

echo json_encode(["error" => "Invalid action"]);