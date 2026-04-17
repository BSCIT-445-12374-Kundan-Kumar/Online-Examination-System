<?php
require_once '../config/database.php';
require_once '../includes/helpers.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';


// ================= LOGIN =================
if ($method === 'POST' && $action === 'login') {
    $body = getRequestBody();

    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    if (!$email || !$password) sendError('Email and password required');

    $conn = getDBConnection();

    $stmt = $conn->prepare("SELECT id, name, email, password, role, is_verified FROM users WHERE email=?");
    $stmt->bind_param('s', $email);
    $stmt->execute();

    $user = $stmt->get_result()->fetch_assoc();

    if (!$user || !password_verify($password, $user['password'])) {
        sendError('Invalid credentials', 401);
    }

    if ($user['is_verified'] == 0) {
        sendError('Please verify your email first');
    }

    $payload = [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + 86400
    ];

    sendResponse([
        'token' => generateJWT($payload),
        'user' => $user
    ]);
}


// ================= REGISTER =================
if ($method === 'POST' && $action === 'register') {
    $body = getRequestBody();

    $name = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    $gender = $body['gender'] ?? null;

    if (!$name || !$email || !$password) sendError('All fields required');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) sendError('Invalid email');

    $conn = getDBConnection();

    $check = $conn->prepare("SELECT id, is_verified FROM users WHERE email=?");
    $check->bind_param('s', $email);
    $check->execute();

    $result = $check->get_result();

    if ($result->num_rows > 0) {
        $existingUser = $result->fetch_assoc();

        //Already verified → block
        if ($existingUser['is_verified'] == 1) {
            sendError('Email already exists');
        }

        //NOT verified → resend OTP
        $otp = rand(100000, 999999);

        $stmt = $conn->prepare("
            UPDATE users 
            SET otp_code=?, otp_expires=DATE_ADD(NOW(), INTERVAL 5 MINUTE) 
            WHERE email=?
        ");
        $stmt->bind_param('is', $otp, $email);
        $stmt->execute();

        require '../vendor/autoload.php';
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'eidkundankumar2004@gmail.com';
            $mail->Password = 'ykkb fhyx qmqt ucdc';
            $mail->SMTPSecure = 'tls';
            $mail->Port = 587;

            $mail->setFrom('eidkundankumar2004@gmail.com', 'Online Examination');
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = 'Email Verification OTP';
            $mail->Body = "
            Hello,<br><br>
            Your OTP is: <b>$otp</b><br>
            Valid for 5 minutes.<br><br>
            - Online Exam System
            ";

            $mail->send();

            sendResponse([
                "message" => "Email already registered but not verified. OTP resent"
            ]);

        } catch (Exception $e) {
            sendError("Email failed: " . $mail->ErrorInfo);
        }
    }

    //New user
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $otp = rand(100000, 999999);

    $stmt = $conn->prepare("
        INSERT INTO users 
        (name, email, password, gender, role, otp_code, otp_expires, is_verified) 
        VALUES (?, ?, ?, ?, 'student', ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 0)
    ");
    $stmt->bind_param('ssssi', $name, $email, $hashed, $gender, $otp);
    $stmt->execute();

    require '../vendor/autoload.php';
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'eidkundankumar2004@gmail.com';
        $mail->Password = 'ykkb fhyx qmqt ucdc';
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        $mail->setFrom('eidkundankumar2004@gmail.com', 'Online Examination');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->Subject = 'Email Verification OTP';
        $mail->Body = "
        Hello,<br><br>
        Your OTP is: <b>$otp</b><br>
        Valid for 5 minutes.<br><br>
        - Online Exam System
        ";

        $mail->send();

        sendResponse(["message" => "Registration successful. OTP sent"]);

    } catch (Exception $e) {
        sendError("Email failed: " . $mail->ErrorInfo);
    }
}


// ================= VERIFY REGISTER OTP =================
if ($method === 'POST' && $action === 'verify-register-otp') {
    $body = getRequestBody();

    $email = trim($body['email'] ?? '');
    $otp = intval($body['otp'] ?? 0);

    if (!$email || !$otp) sendError("Email and OTP required");

    $conn = getDBConnection();

    $stmt = $conn->prepare("
        SELECT id FROM users 
        WHERE email=? AND otp_code=? AND otp_expires > NOW()
    ");
    $stmt->bind_param('si', $email, $otp);
    $stmt->execute();

    $user = $stmt->get_result()->fetch_assoc();

    if (!$user) {
        sendError("Invalid or expired OTP");
    }

    $stmt = $conn->prepare("
        UPDATE users 
        SET is_verified=1, otp_code=NULL, otp_expires=NULL 
        WHERE id=?
    ");
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();

    sendResponse(["message" => "Email verified successfully"]);
}


// ================= RESEND OTP =================
if ($method === 'POST' && $action === 'resend-otp') {
    $body = getRequestBody();

    $email = trim($body['email'] ?? '');
    if (!$email) sendError("Email required");

    $conn = getDBConnection();

    $otp = rand(100000, 999999);

    $stmt = $conn->prepare("
        UPDATE users 
        SET otp_code=?, otp_expires=DATE_ADD(NOW(), INTERVAL 5 MINUTE) 
        WHERE email=?
    ");
    $stmt->bind_param('is', $otp, $email);
    $stmt->execute();

    require '../vendor/autoload.php';
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'eidkundankumar2004@gmail.com';
        $mail->Password = 'ykkb fhyx qmqt ucdc';
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        $mail->setFrom('eidkundankumar2004@gmail.com', 'Online Examination');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->Subject = 'Resend OTP';
        $mail->Body = "
        Your new OTP is <b>$otp</b><br>
        Valid for 5 minutes.
        ";

        $mail->send();

        sendResponse(["message" => "OTP resent"]);

    } catch (Exception $e) {
        sendError("Email failed: " . $mail->ErrorInfo);
    }
}


// ================= PASSWORD RESET OTP =================
if ($method === 'POST' && $action === 'send-otp') {
    $body = getRequestBody();

    $email = trim($body['email'] ?? '');
    if (!$email) sendError("Email required");

    $conn = getDBConnection();

    $stmt = $conn->prepare("SELECT id FROM users WHERE email=?");
    $stmt->bind_param('s', $email);
    $stmt->execute();

    $user = $stmt->get_result()->fetch_assoc();
    if (!$user) sendError("Email not found");

    $otp = rand(100000, 999999);

    $stmt = $conn->prepare("
        UPDATE users 
        SET reset_otp=?, otp_expires=DATE_ADD(NOW(), INTERVAL 5 MINUTE) 
        WHERE email=?
    ");
    $stmt->bind_param('is', $otp, $email);
    $stmt->execute();

    require '../vendor/autoload.php';
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'eidkundankumar2004@gmail.com';
        $mail->Password = 'ykkb fhyx qmqt ucdc';
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        $mail->setFrom('eidkundankumar2004@gmail.com', 'Online Examination');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->Subject = 'Password Reset OTP';
        $mail->Body = "
        Your OTP is: <b>$otp</b><br>
        Valid for 5 minutes.
        ";

        $mail->send();

        sendResponse(["message" => "OTP sent"]);

    } catch (Exception $e) {
        sendError("Email failed: " . $mail->ErrorInfo);
    }
}


// ================= VERIFY RESET OTP =================
if ($method === 'POST' && $action === 'verify-otp') {
    $body = getRequestBody();

    $email = trim($body['email'] ?? '');
    $otp = intval($body['otp'] ?? 0);
    $password = $body['password'] ?? '';

    if (!$email || !$otp || !$password) sendError("All fields required");

    $conn = getDBConnection();

    $stmt = $conn->prepare("
        SELECT id FROM users 
        WHERE email=? AND reset_otp=? AND otp_expires > NOW()
    ");
    $stmt->bind_param('si', $email, $otp);
    $stmt->execute();

    $user = $stmt->get_result()->fetch_assoc();

    if (!$user) {
        sendError("Invalid or expired OTP");
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("
        UPDATE users 
        SET password=?, reset_otp=NULL, otp_expires=NULL 
        WHERE id=?
    ");
    $stmt->bind_param('si', $hashed, $user['id']);
    $stmt->execute();

    sendResponse(["message" => "Password reset successful"]);
}


// ================= ME =================
if ($method === 'GET' && $action === 'me') {
    $user = getAuthUser();

    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT id, name, email, role, created_at FROM users WHERE id=?");
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();

    sendResponse($stmt->get_result()->fetch_assoc());
}


sendError('Invalid endpoint', 404);