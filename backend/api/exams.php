<?php
// backend/api/exams.php
require_once '../config/database.php';
require_once '../includes/helpers.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = (int)($_GET['id'] ?? 0);

// GET all exams (student/admin)
if ($method === 'GET' && $action === 'list') {
    $user = getAuthUser();
    $conn = getDBConnection();

    if ($user['role'] === 'admin') {
        $sql = "SELECT e.*, u.name as created_by_name,
                (SELECT COUNT(*) FROM questions WHERE exam_id = e.id) as question_count,
                (SELECT COUNT(*) FROM exam_attempts WHERE exam_id = e.id) as attempt_count
                FROM exams e LEFT JOIN users u ON e.created_by = u.id ORDER BY e.created_at DESC";
        $result = $conn->query($sql);
    } else {
        $sid = $user['id'];
        $sql = "SELECT e.*,
                (SELECT COUNT(*) FROM questions WHERE exam_id = e.id) as question_count,
                (SELECT id FROM exam_attempts WHERE exam_id = e.id AND student_id = $sid AND status = 'completed' LIMIT 1) as attempt_id,
                (SELECT score FROM exam_attempts WHERE exam_id = e.id AND student_id = $sid AND status = 'completed' LIMIT 1) as my_score,
                (SELECT status FROM exam_attempts WHERE exam_id = e.id AND student_id = $sid ORDER BY start_time DESC LIMIT 1) as my_status
                FROM exams e WHERE e.is_active = 1 ORDER BY e.created_at DESC";
        $result = $conn->query($sql);
    }

    $exams = [];
    while ($row = $result->fetch_assoc()) $exams[] = $row;
    sendResponse($exams);
}

// GET single exam
if ($method === 'GET' && $action === 'get' && $id) {
    $user = getAuthUser();
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT * FROM exams WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $exam = $stmt->get_result()->fetch_assoc();
    if (!$exam) sendError('Exam not found', 404);
    sendResponse($exam);
}

// CREATE exam (admin only)
if ($method === 'POST' && $action === 'create') {
    $admin = requireRole('admin');
    $body = getRequestBody();
    $title = trim($body['title'] ?? '');
    $desc = trim($body['description'] ?? '');
    $subject = trim($body['subject'] ?? '');
    $duration = (int)($body['duration_minutes'] ?? 60);
    $total = (int)($body['total_marks'] ?? 100);
    $pass = (int)($body['pass_marks'] ?? 40);
    $active = isset($body['is_active']) ? (int)$body['is_active'] : 1;

    if (!$title) sendError('Title required');

    $conn = getDBConnection();
    $stmt = $conn->prepare("INSERT INTO exams (title, description, subject, duration_minutes, total_marks, pass_marks, is_active, created_by) VALUES (?,?,?,?,?,?,?,?)");
    $stmt->bind_param('sssiiiii', $title, $desc, $subject, $duration, $total, $pass, $active, $admin['id']);
    $stmt->execute();
    $newId = $stmt->insert_id;
    sendResponse(['id' => $newId, 'message' => 'Exam created successfully'], 201);
}

// UPDATE exam (admin only)
if ($method === 'PUT' && $action === 'update' && $id) {
    requireRole('admin');
    $body = getRequestBody();
    $conn = getDBConnection();
    $stmt = $conn->prepare("UPDATE exams SET title=?, description=?, subject=?, duration_minutes=?, total_marks=?, pass_marks=?, is_active=? WHERE id=?");
    $stmt->bind_param('sssiiiii', $body['title'], $body['description'], $body['subject'], $body['duration_minutes'], $body['total_marks'], $body['pass_marks'], $body['is_active'], $id);
    $stmt->execute();
    sendResponse(['message' => 'Exam updated successfully']);
}

// DELETE exam (admin only)
if ($method === 'DELETE' && $action === 'delete' && $id) {
    requireRole('admin');
    $conn = getDBConnection();
    $stmt = $conn->prepare("DELETE FROM exams WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    sendResponse(['message' => 'Exam deleted successfully']);
}

// GET questions for exam
if ($method === 'GET' && $action === 'questions' && $id) {
    $user = getAuthUser();
    $conn = getDBConnection();
    if ($user['role'] === 'admin') {
        $stmt = $conn->prepare("SELECT * FROM questions WHERE exam_id = ? ORDER BY id");
    } else {
        // Students don't see correct answer
        $stmt = $conn->prepare("SELECT id, exam_id, question_text, option_a, option_b, option_c, option_d, marks FROM questions WHERE exam_id = ? ORDER BY id");
    }
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $questions = [];
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) $questions[] = $row;
    sendResponse($questions);
}

// ADD question (admin only)
if ($method === 'POST' && $action === 'add_question') {
    requireRole('admin');
    $body = getRequestBody();
    $conn = getDBConnection();
    $stmt = $conn->prepare("INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES (?,?,?,?,?,?,?,?)");
    $stmt->bind_param('issssssi', $body['exam_id'], $body['question_text'], $body['option_a'], $body['option_b'], $body['option_c'], $body['option_d'], $body['correct_answer'], $body['marks']);
    $stmt->execute();
    sendResponse(['id' => $stmt->insert_id, 'message' => 'Question added'], 201);
}

// DELETE question (admin only)
if ($method === 'DELETE' && $action === 'delete_question' && $id) {
    requireRole('admin');
    $conn = getDBConnection();
    $stmt = $conn->prepare("DELETE FROM questions WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    sendResponse(['message' => 'Question deleted']);
}

sendError('Invalid endpoint', 404);
