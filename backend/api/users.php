<?php
// backend/api/users.php
require_once '../config/database.php';
require_once '../includes/helpers.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = (int)($_GET['id'] ?? 0);

// GET all users (admin)
if ($method === 'GET' && $action === 'list') {
    requireRole('admin');
    $conn = getDBConnection();
    $result = $conn->query("SELECT id, name, email, gender, role, created_at FROM users ORDER BY created_at DESC");
    $users = [];
    while ($row = $result->fetch_assoc()) $users[] = $row;
    sendResponse($users);
}

// GET user stats (admin)
if ($method === 'GET' && $action === 'stats') {
    requireRole('admin');
    $conn = getDBConnection();
    $stats = [];
    $stats['total_users'] = $conn->query("SELECT COUNT(*) as c FROM users WHERE role='student'")->fetch_assoc()['c'];
    $stats['total_exams'] = $conn->query("SELECT COUNT(*) as c FROM exams")->fetch_assoc()['c'];
    $stats['total_attempts'] = $conn->query("SELECT COUNT(*) as c FROM exam_attempts WHERE status='completed'")->fetch_assoc()['c'];
    $stats['avg_score'] = $conn->query("SELECT ROUND(AVG(score/total_marks*100),1) as avg FROM exam_attempts WHERE status='completed'")->fetch_assoc()['avg'] ?? 0;
    sendResponse($stats);
}

// DELETE user (admin)
if ($method === 'DELETE' && $action === 'delete' && $id) {
    requireRole('admin');
    $conn = getDBConnection();
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    sendResponse(['message' => 'User deleted']);
}

sendError('Invalid endpoint', 404);
