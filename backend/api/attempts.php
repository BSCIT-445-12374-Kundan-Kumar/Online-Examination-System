<?php
// backend/api/attempts.php
require_once '../config/database.php';
require_once '../includes/helpers.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = (int)($_GET['id'] ?? 0);

// Start an exam attempt
if ($method === 'POST' && $action === 'start') {
    $user = getAuthUser();
    $body = getRequestBody();
    $examId = (int)($body['exam_id'] ?? 0);
    if (!$examId) sendError('exam_id required');

    $conn = getDBConnection();

    // Check if already in progress
    $check = $conn->prepare("SELECT id, status FROM exam_attempts WHERE exam_id = ? AND student_id = ? ORDER BY start_time DESC LIMIT 1");
    $check->bind_param('ii', $examId, $user['id']);
    $check->execute();
    $existing = $check->get_result()->fetch_assoc();

    if ($existing && $existing['status'] === 'in_progress') {
        sendResponse(['attempt_id' => $existing['id'], 'message' => 'Resuming existing attempt']);
    }
    if ($existing && $existing['status'] === 'completed') {
        sendError('You have already completed this exam', 400);
    }

    // Check exam exists and is active
    $eStmt = $conn->prepare("SELECT * FROM exams WHERE id = ? AND is_active = 1");
    $eStmt->bind_param('i', $examId);
    $eStmt->execute();
    $exam = $eStmt->get_result()->fetch_assoc();
    if (!$exam) sendError('Exam not found or inactive', 404);

    $stmt = $conn->prepare("INSERT INTO exam_attempts (exam_id, student_id, total_marks) VALUES (?, ?, ?)");
    $stmt->bind_param('iii', $examId, $user['id'], $exam['total_marks']);
    $stmt->execute();
    sendResponse(['attempt_id' => $stmt->insert_id, 'duration_minutes' => $exam['duration_minutes']], 201);
}

// Submit answers
if ($method === 'POST' && $action === 'submit') {
    $user = getAuthUser();
    $body = getRequestBody();
    $attemptId = (int)($body['attempt_id'] ?? 0);
    $answers = $body['answers'] ?? []; // [{question_id, selected_answer}]

    if (!$attemptId) sendError('attempt_id required');

    $conn = getDBConnection();

    // Verify attempt belongs to user
    $aStmt = $conn->prepare("SELECT a.*, e.pass_marks FROM exam_attempts a JOIN exams e ON a.exam_id = e.id WHERE a.id = ? AND a.student_id = ?");
    $aStmt->bind_param('ii', $attemptId, $user['id']);
    $aStmt->execute();
    $attempt = $aStmt->get_result()->fetch_assoc();
    if (!$attempt) sendError('Attempt not found', 404);
    if ($attempt['status'] === 'completed') sendError('Exam already submitted', 400);

    $score = 0;

    // Get all correct answers for this exam
    $qStmt = $conn->prepare("SELECT id, correct_answer, marks FROM questions WHERE exam_id = ?");
    $qStmt->bind_param('i', $attempt['exam_id']);
    $qStmt->execute();
    $correctMap = [];
    $qResult = $qStmt->get_result();
    while ($row = $qResult->fetch_assoc()) {
        $correctMap[$row['id']] = $row;
    }

    // Insert student answers
    $conn->begin_transaction();
    try {
        foreach ($answers as $ans) {
            $qid = (int)$ans['question_id'];
            $sel = $ans['selected_answer'] ?? null;
            $isCorrect = 0;
            if ($sel && isset($correctMap[$qid]) && $correctMap[$qid]['correct_answer'] === $sel) {
                $isCorrect = 1;
                $score += $correctMap[$qid]['marks'];
            }
            $insStmt = $conn->prepare("INSERT INTO student_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE selected_answer=?, is_correct=?");
            $insStmt->bind_param('iisisi', $attemptId, $qid, $sel, $isCorrect, $sel, $isCorrect);
            $insStmt->execute();
        }

        $upStmt = $conn->prepare("UPDATE exam_attempts SET score = ?, status = 'completed', end_time = NOW() WHERE id = ?");
        $upStmt->bind_param('ii', $score, $attemptId);
        $upStmt->execute();
        $conn->commit();
    } catch (Exception $e) {
        $conn->rollback();
        sendError('Submission failed: ' . $e->getMessage(), 500);
    }

    $passed = $score >= $attempt['pass_marks'];
    sendResponse([
        'score' => $score,
        'total_marks' => $attempt['total_marks'],
        'pass_marks' => $attempt['pass_marks'],
        'passed' => $passed,
        'message' => $passed ? 'Congratulations! You passed!' : 'Better luck next time!'
    ]);
}

// Get result with detailed answers
if ($method === 'GET' && $action === 'result' && $id) {
    $user = getAuthUser();
    $conn = getDBConnection();

    $aStmt = $conn->prepare("SELECT a.*, e.title, e.subject, e.pass_marks, e.duration_minutes FROM exam_attempts a JOIN exams e ON a.exam_id = e.id WHERE a.id = ?");
    $aStmt->bind_param('i', $id);
    $aStmt->execute();
    $attempt = $aStmt->get_result()->fetch_assoc();

    if (!$attempt) sendError('Result not found', 404);
    if ($user['role'] !== 'admin' && $attempt['student_id'] != $user['id']) sendError('Access denied', 403);

    // Get answers with question details
    $ansStmt = $conn->prepare("
        SELECT q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.marks,
               sa.selected_answer, sa.is_correct
        FROM student_answers sa
        JOIN questions q ON sa.question_id = q.id
        WHERE sa.attempt_id = ?
        ORDER BY q.id
    ");
    $ansStmt->bind_param('i', $id);
    $ansStmt->execute();
    $details = [];
    $dResult = $ansStmt->get_result();
    while ($row = $dResult->fetch_assoc()) $details[] = $row;

    sendResponse(['attempt' => $attempt, 'details' => $details]); 
}

// Get student's attempts
if ($method === 'GET' && $action === 'my_attempts') {
    $user = getAuthUser();
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT a.*, e.title, e.subject, e.pass_marks, u.name AS student_name FROM exam_attempts a JOIN exams e ON a.exam_id = e.id JOIN users u ON a.student_id = u.id WHERE a.student_id = ? ORDER BY a.start_time DESC");
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $attempts = [];
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) $attempts[] = $row;
    sendResponse($attempts);
}

// Admin: get all attempts
if ($method === 'GET' && $action === 'all') {
    requireRole('admin');
    $conn = getDBConnection();
    $examFilter = $id ? "WHERE a.exam_id = $id" : "";
    $sql = "SELECT a.*, e.title as exam_title, e.pass_marks, u.name as student_name, u.email as student_email
            FROM exam_attempts a JOIN exams e ON a.exam_id = e.id JOIN users u ON a.student_id = u.id
            $examFilter ORDER BY a.start_time DESC LIMIT 100";
    $result = $conn->query($sql);
    $attempts = [];
    while ($row = $result->fetch_assoc()) $attempts[] = $row;
    sendResponse($attempts);
}

sendError('Invalid endpoint', 404);
