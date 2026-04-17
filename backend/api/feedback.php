<?php
require_once '../config/database.php';
require_once '../includes/helpers.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$conn = getDBConnection();


// ADD FEEDBACK
if ($method === 'POST' && $action === 'add') {
    $user = getAuthUser();
    $body = getRequestBody();

    $message = trim($body['message'] ?? '');
    $rating = (int)($body['rating'] ?? 5);

    if (!$message) sendError("Message required");

    if ($rating < 1 || $rating > 5) {
        sendError("Rating must be between 1 and 5");
    }

    $stmt = $conn->prepare("INSERT INTO feedback (student_id, message, rating) VALUES (?, ?, ?)");
    if (!$stmt) sendError($conn->error);

    $stmt->bind_param('isi', $user['id'], $message, $rating);

    if (!$stmt->execute()) {
        sendError($stmt->error);
    }

    sendResponse(["message" => "Feedback submitted"]);
}


// STUDENT: MY FEEDBACK
if ($method === 'GET' && $action === 'my') {
    $user = getAuthUser();

    $stmt = $conn->prepare("
        SELECT message, rating, created_at
        FROM feedback
        WHERE student_id = ?
        ORDER BY created_at DESC
    ");

    if (!$stmt) sendError($conn->error);

    $stmt->bind_param('i', $user['id']);
    $stmt->execute();

    $res = $stmt->get_result();
    $data = [];

    while ($row = $res->fetch_assoc()) {
        $data[] = $row;
    }

    sendResponse($data);
}


// ADMIN: ALL FEEDBACK
if ($method === 'GET' && $action === 'list') {
    requireRole('admin');

    $sql = "SELECT f.*, u.name, u.email
            FROM feedback f
            JOIN users u ON f.student_id = u.id
            ORDER BY f.created_at DESC";

    $result = $conn->query($sql);

    if (!$result) sendError($conn->error);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    sendResponse($data);
}

sendError("Invalid endpoint", 404);