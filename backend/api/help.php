<?php
require_once '../config/database.php';
require_once '../includes/helpers.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = (int)($_GET['id'] ?? 0);

$conn = getDBConnection();

if ($method === 'POST' && $action === 'add') {
    $user = getAuthUser();
    $body = getRequestBody();

    $subject = trim($body['subject'] ?? '');
    $message = trim($body['message'] ?? '');
    $type = $body['type'] ?? 'technical';
    $other = trim($body['other'] ?? '');

    if (!$subject || !$message) sendError("Subject and message required");

    $allowedTypes = ['technical','exam','account','suggestion','other'];
    if (!in_array($type, $allowedTypes)) $type = 'technical';

    if ($type === 'other' && !$other) sendError("Specify other type");

    if ($type === 'other') {
        $message = "[Other: $other] - " . $message;
    }

    $stmt = $conn->prepare("INSERT INTO help_requests (student_id, subject, message, type) VALUES (?, ?, ?, ?)");
    if (!$stmt) sendError($conn->error);

    $stmt->bind_param('isss', $user['id'], $subject, $message, $type);

    if (!$stmt->execute()) sendError($stmt->error);

    sendResponse(["message" => "Request submitted"]);
}

if ($method === 'GET' && $action === 'my') {
    $user = getAuthUser();

    $stmt = $conn->prepare("SELECT * FROM help_requests WHERE student_id=? ORDER BY created_at DESC");
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();

    $res = $stmt->get_result();
    $data = [];

    while ($row = $res->fetch_assoc()) {
        $data[] = $row;
    }

    sendResponse($data);
}

if ($method === 'GET' && $action === 'list') {
    requireRole('admin');

    $status = $_GET['status'] ?? '';
    $type = $_GET['type'] ?? '';
    $search = $_GET['search'] ?? '';

    $sql = "SELECT h.*, u.name, u.email
            FROM help_requests h
            JOIN users u ON h.student_id = u.id
            WHERE 1=1";

    if ($status !== '') {
        $status = $conn->real_escape_string($status);
        $sql .= " AND h.status = '$status'";
    }

    if ($type !== '') {
        $type = $conn->real_escape_string($type);
        $sql .= " AND h.type = '$type'";
    }

    if ($search !== '') {
        $search = $conn->real_escape_string($search);
        $sql .= " AND (u.name LIKE '%$search%' 
                    OR u.email LIKE '%$search%' 
                    OR h.subject LIKE '%$search%')";
    }

    $sql .= " ORDER BY h.created_at DESC";

    $result = $conn->query($sql);
    if (!$result) sendError($conn->error);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    sendResponse($data);
}

if ($method === 'PUT' && $action === 'update' && $id) {
    requireRole('admin');

    $body = getRequestBody();
    $status = $body['status'] ?? '';

    $allowed = ['pending','in_progress','resolved'];

    if (!in_array($status, $allowed)) {
        sendError("Invalid status");
    }

    $stmt = $conn->prepare("UPDATE help_requests SET status=? WHERE id=?");
    if (!$stmt) sendError($conn->error);

    $stmt->bind_param('si', $status, $id);

    if (!$stmt->execute()) {
        sendError($stmt->error);
    }

    sendResponse(["message" => "Status updated"]);
}

sendError("Invalid endpoint", 404);