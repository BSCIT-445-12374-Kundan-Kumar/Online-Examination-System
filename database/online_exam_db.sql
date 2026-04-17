-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 13, 2026 at 07:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `online_exam_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 60,
  `total_marks` int(11) NOT NULL DEFAULT 100,
  `pass_marks` int(11) NOT NULL DEFAULT 40,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`id`, `title`, `description`, `subject`, `duration_minutes`, `total_marks`, `pass_marks`, `start_time`, `end_time`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'General Knowledge Test', 'Test your general knowledge with this comprehensive exam', 'General Knowledge', 2, 20, 10, NULL, NULL, 1, 1, '2026-03-25 07:25:54', '2026-03-30 11:42:25'),
(2, 'Mathematics Basics', 'Fundamental mathematics questions for beginners', 'Mathematics', 45, 30, 15, NULL, NULL, 1, 1, '2026-03-25 07:25:54', '2026-03-26 18:35:25'),
(3, 'Computer Science Fundamentals', 'Basic concepts of computer science and programming', 'Computer Science', 60, 40, 20, NULL, NULL, 1, 1, '2026-03-25 07:25:54', '2026-03-26 18:35:31'),
(7, 'Basics of Excel', 'Basic Excel for Evaluate your Performance.', 'Excel', 1, 5, 2, NULL, NULL, 1, 4, '2026-03-29 10:22:54', '2026-04-11 07:49:14'),
(9, 'Basic of python', 'Basic', 'Python', 10, 10, 6, NULL, NULL, 1, 4, '2026-04-11 08:10:26', '2026-04-11 08:10:38');

-- --------------------------------------------------------

--
-- Table structure for table `exam_attempts`
--

CREATE TABLE `exam_attempts` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NULL DEFAULT NULL,
  `score` int(11) DEFAULT 0,
  `total_marks` int(11) DEFAULT 0,
  `status` enum('in_progress','completed','timed_out') DEFAULT 'in_progress'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_attempts`
--

INSERT INTO `exam_attempts` (`id`, `exam_id`, `student_id`, `start_time`, `end_time`, `score`, `total_marks`, `status`) VALUES
(3, 3, 1, '2026-03-25 14:14:07', '2026-03-25 14:16:52', 28, 40, 'completed'),
(4, 3, 2, '2026-03-25 14:56:50', '2026-03-25 14:57:40', 32, 40, 'completed'),
(6, 1, 6, '2026-03-26 17:23:06', '2026-03-26 17:24:24', 4, 20, 'completed'),
(8, 7, 6, '2026-03-29 10:31:42', '2026-03-29 10:32:17', 0, 5, 'completed'),
(9, 7, 6, '2026-03-29 10:31:42', '2026-03-29 10:31:43', 0, 5, 'completed'),
(10, 7, 5, '2026-03-29 10:35:02', '2026-03-29 10:36:03', 0, 5, 'completed'),
(13, 1, 5, '2026-03-30 11:42:33', '2026-03-30 11:54:08', 10, 20, 'completed'),
(14, 1, 5, '2026-03-30 11:42:33', '2026-03-30 11:44:33', 0, 20, 'completed'),
(15, 7, 9, '2026-03-30 16:12:37', '2026-03-30 16:13:37', 4, 5, 'completed'),
(23, 9, 5, '2026-04-11 08:15:56', '2026-04-11 08:17:05', 5, 10, 'completed');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `rating` int(11) DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `student_id`, `message`, `created_at`, `rating`) VALUES
(1, 5, 'this is quite good!', '2026-03-30 12:50:02', 3),
(2, 9, 'wow! Ui is just crazy....', '2026-03-30 15:14:57', 5),
(3, 9, 'When supervisors offer consistent, actionable feedback, they often improve their team\'s performance. While positive feedback is often easier to give, constructive feedback is also important. If you manage a team, then you may benefit from reading about different scenarios where offering feedback can be helpful.', '2026-03-30 15:16:34', 4),
(4, 9, 'All good but forget password option need', '2026-03-30 16:06:57', 2);

-- --------------------------------------------------------

--
-- Table structure for table `help_requests`
--

CREATE TABLE `help_requests` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('pending','in_progress','resolved') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `type` enum('technical','exam','account','suggestion','other') DEFAULT 'technical',
  `other_text` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `help_requests`
--

INSERT INTO `help_requests` (`id`, `student_id`, `subject`, `message`, `status`, `created_at`, `type`, `other_text`) VALUES
(1, 5, 'Forget password', 'i want rest my password!', 'resolved', '2026-03-30 12:47:59', 'other', 'Password'),
(2, 5, 'OTP issue', '[Other: OTP] - whenever i generate otp it give error!', 'in_progress', '2026-03-30 14:25:05', 'other', 'OTP'),
(3, 5, 'Generation issue', 'Exam not loading !', 'pending', '2026-03-30 14:27:31', 'exam', ''),
(4, 9, 'Forget password need', 'we need option for forget password', 'resolved', '2026-03-30 16:08:21', 'technical', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `option_a` varchar(500) NOT NULL,
  `option_b` varchar(500) NOT NULL,
  `option_c` varchar(500) NOT NULL,
  `option_d` varchar(500) NOT NULL,
  `correct_answer` enum('A','B','C','D') NOT NULL,
  `marks` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `exam_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `marks`, `created_at`) VALUES
(1, 1, 'What is the capital of India?', 'Mumbai', 'New Delhi', 'Kolkata', 'Chennai', 'B', 2, '2026-03-25 07:25:54'),
(2, 1, 'Which planet is known as the Red Planet?', 'Venus', 'Jupiter', 'Mars', 'Saturn', 'C', 2, '2026-03-25 07:25:54'),
(3, 1, 'Who invented the telephone?', 'Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Benjamin Franklin', 'C', 2, '2026-03-25 07:25:54'),
(4, 1, 'What is the largest ocean on Earth?', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean', 'D', 2, '2026-03-25 07:25:54'),
(5, 1, 'How many continents are there on Earth?', '5', '6', '7', '8', 'C', 2, '2026-03-25 07:25:54'),
(6, 1, 'What is the chemical symbol for Gold?', 'Go', 'Gd', 'Au', 'Ag', 'C', 2, '2026-03-25 07:25:54'),
(7, 1, 'Which country has the largest population?', 'USA', 'China', 'India', 'Russia', 'B', 2, '2026-03-25 07:25:54'),
(8, 1, 'What is the smallest planet in our solar system?', 'Earth', 'Mars', 'Mercury', 'Pluto', 'C', 2, '2026-03-25 07:25:54'),
(9, 1, 'Who wrote the play \"Romeo and Juliet\"?', 'Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain', 'B', 2, '2026-03-25 07:25:54'),
(10, 1, 'What is the speed of light approximately?', '300,000 km/s', '150,000 km/s', '450,000 km/s', '100,000 km/s', 'A', 2, '2026-03-25 07:25:54'),
(11, 2, 'What is 15 × 12?', '170', '180', '185', '175', 'B', 3, '2026-03-25 07:25:54'),
(12, 2, 'What is the square root of 144?', '11', '13', '12', '14', 'C', 3, '2026-03-25 07:25:54'),
(13, 2, 'Solve: 2x + 5 = 15. What is x?', '3', '4', '5', '6', 'C', 3, '2026-03-25 07:25:54'),
(14, 2, 'What is 25% of 200?', '40', '45', '50', '55', 'C', 3, '2026-03-25 07:25:54'),
(15, 2, 'If a triangle has sides 3, 4, and 5, what type of triangle is it?', 'Equilateral', 'Isosceles', 'Right-angled', 'Obtuse', 'C', 3, '2026-03-25 07:25:54'),
(16, 2, 'What is the value of pi (π) approximately?', '3.14', '3.41', '3.12', '3.16', 'A', 3, '2026-03-25 07:25:54'),
(17, 2, 'What is 2^10?', '512', '1024', '2048', '256', 'B', 3, '2026-03-25 07:25:54'),
(18, 2, 'What is the LCM of 4 and 6?', '8', '10', '12', '24', 'C', 3, '2026-03-25 07:25:54'),
(19, 2, 'Convert 0.75 to a fraction', '3/4', '2/3', '4/5', '1/2', 'A', 3, '2026-03-25 07:25:54'),
(20, 2, 'What is the area of a circle with radius 7? (Use π = 22/7)', '144 sq units', '154 sq units', '164 sq units', '134 sq units', 'B', 3, '2026-03-25 07:25:54'),
(21, 3, 'What does CPU stand for?', 'Central Processing Unit', 'Computer Processing Utility', 'Central Program Unit', 'Core Processing Unit', 'A', 4, '2026-03-25 07:25:54'),
(22, 3, 'Which language is known as the mother of all languages?', 'C', 'Python', 'Assembly', 'Fortran', 'A', 4, '2026-03-25 07:25:54'),
(23, 3, 'What is the binary representation of decimal 10?', '1010', '1001', '1100', '0110', 'A', 4, '2026-03-25 07:25:54'),
(24, 3, 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Transfer Markup Language', 'Hyper Text Making Language', 'A', 4, '2026-03-25 07:25:54'),
(25, 3, 'Which data structure uses LIFO principle?', 'Queue', 'Stack', 'Linked List', 'Tree', 'B', 4, '2026-03-25 07:25:54'),
(26, 3, 'What is the time complexity of Binary Search?', 'O(n)', 'O(n²)', 'O(log n)', 'O(1)', 'C', 4, '2026-03-25 07:25:54'),
(27, 3, 'What does RAM stand for?', 'Random Access Memory', 'Read Access Memory', 'Rapid Access Module', 'Read And Memory', 'A', 4, '2026-03-25 07:25:54'),
(28, 3, 'Which protocol is used for web browsing?', 'FTP', 'HTTP', 'SMTP', 'SSH', 'B', 4, '2026-03-25 07:25:54'),
(29, 3, 'What is an IP address?', 'Internet Protocol Address', 'Internal Protocol Address', 'Internet Postal Address', 'Input Protocol Address', 'A', 4, '2026-03-25 07:25:54'),
(30, 3, 'What is the full form of SQL?', 'Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'Sequential Query Language', 'A', 4, '2026-03-25 07:25:54'),
(41, 7, 'What is the Extension of Excel?', '.xlsx', '.slxs', '.lsx', '.my', 'A', 0, '2026-03-29 10:24:08'),
(42, 7, 'What do Excel formulas always start with?', '+', '$', '=', '#', 'C', 1, '2026-03-29 10:26:18'),
(43, 7, 'The intersection of a column and a row in a worksheet is called a:', 'Range', 'Cell', 'Workbook', 'Address', 'B', 1, '2026-03-29 10:27:19'),
(44, 7, 'Which function is used to add the values of a range of cells?', 'TOTAL()', 'ADD()', 'SUM()', 'COUNT()', 'C', 1, '2026-03-29 10:28:24'),
(45, 7, 'Which keyboard shortcut is used to save an Excel workbook?', 'CTRL + SHIFT + S', 'CTRL + P', 'CTRL + S', 'ALT + S', 'C', 1, '2026-03-29 10:30:01'),
(46, 7, 'Which feature allows you to quickly copy a formula or data to adjacent cells by clicking and dragging the bottom-right corner of a cell?', 'Format Painter', 'AutoSum', 'Fill Handle', 'Data Validation', 'C', 0, '2026-03-29 10:31:20'),
(49, 9, 'what is python?', 'programming language', 'markup language', 'db', 'Web', 'A', 5, '2026-04-11 08:11:37'),
(50, 9, 'what\'s the extension of python?', '.ph', '.py', '.xlsx', '.txt', 'B', 5, '2026-04-11 08:12:26');

-- --------------------------------------------------------

--
-- Table structure for table `student_answers`
--

CREATE TABLE `student_answers` (
  `id` int(11) NOT NULL,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_answer` enum('A','B','C','D') DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_answers`
--

INSERT INTO `student_answers` (`id`, `attempt_id`, `question_id`, `selected_answer`, `is_correct`) VALUES
(3, 3, 21, 'A', 1),
(4, 3, 22, 'C', 0),
(5, 3, 23, 'C', 0),
(6, 3, 24, 'A', 1),
(7, 3, 25, 'B', 1),
(8, 3, 26, 'D', 0),
(9, 3, 27, 'A', 1),
(10, 3, 28, 'B', 1),
(11, 3, 29, 'A', 1),
(12, 3, 30, 'A', 1),
(13, 4, 21, 'A', 1),
(14, 4, 22, 'A', 1),
(15, 4, 23, 'C', 0),
(16, 4, 24, 'A', 1),
(17, 4, 25, 'B', 1),
(18, 4, 26, 'D', 0),
(19, 4, 27, 'A', 1),
(20, 4, 28, 'B', 1),
(21, 4, 29, 'A', 1),
(22, 4, 30, 'A', 1),
(28, 6, 1, 'A', 0),
(29, 6, 2, 'B', 0),
(30, 6, 3, 'C', 1),
(31, 6, 4, 'B', 0),
(32, 6, 5, 'A', 0),
(33, 6, 6, 'C', 1),
(34, 6, 7, 'A', 0),
(35, 6, 8, 'B', 0),
(36, 6, 10, 'B', 0),
(41, 13, 1, 'B', 1),
(42, 13, 2, 'C', 1),
(44, 13, 3, 'C', 1),
(45, 13, 4, 'A', 0),
(48, 13, 5, 'B', 0),
(50, 13, 6, 'C', 1),
(52, 13, 7, 'B', 1),
(54, 15, 41, 'A', 1),
(56, 15, 42, 'C', 1),
(57, 15, 43, 'B', 1),
(59, 15, 44, 'C', 1),
(62, 15, 45, 'C', 1),
(64, 15, 46, 'A', 0),
(92, 23, 49, 'A', 1),
(93, 23, 49, 'A', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','student') DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_otp` varchar(6) DEFAULT NULL,
  `otp_expires` datetime DEFAULT NULL,
  `otp_code` int(11) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `gender`, `email`, `password`, `role`, `created_at`, `updated_at`, `reset_otp`, `otp_expires`, `otp_code`, `is_verified`) VALUES
(1, 'Admin User', 'Male', 'admin@examportal.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '2026-03-25 07:25:54', '2026-03-31 16:12:14', NULL, NULL, NULL, 1),
(2, 'Rahul Sharma', 'Male', 'rahul@student.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', '2026-03-25 07:25:54', '2026-03-31 16:12:18', NULL, NULL, NULL, 1),
(4, 'kundan kumar', 'Male', 'kundanAdmin@gmail.com', '$2y$10$Gtzoa1E1/bhkyVdeNtjzIugtqUMKJNUVwYBE9Bs1cTgN8O4VjSqQK', 'admin', '2026-03-25 07:27:50', '2026-03-31 15:30:57', NULL, NULL, NULL, 1),
(5, 'Shubham kumar', 'Male', 'shubham123@gmail.com', '$2y$10$pZJYkPzL7hLccVjzW2Sqy.H5.XcsVmQvmqUgM9CyY6DHVgBxhUV5a', 'student', '2026-03-25 07:58:11', '2026-03-31 15:31:13', NULL, NULL, NULL, 1),
(6, 'Raja Sharma', 'Male', 'Raja@student.com', '$2y$10$y4I7CF0Uh2C41c.hiFa74u04i.ty/z0flY6LNuTKtNqHGYpgVVQvG', 'student', '2026-03-26 17:09:08', '2026-03-31 15:31:19', NULL, NULL, NULL, 1),
(7, 'Ankit kumar', 'Male', 'Ankit@student.com', '$2y$10$GrtVb.hxMfmYvuKCWx89F.X4c8fqDpSa/snf7xEwz1JkjVZfPrjk6', 'student', '2026-03-29 11:10:50', '2026-03-31 15:31:23', NULL, NULL, NULL, 1),
(9, 'Neha Singh', 'Female', 'Neha@student.com', '$2y$10$6LvyipzuKdBYtIVgfiVUW.LvA.snr85Q4kr4FFEgGDiupDmGD5G06', 'student', '2026-03-29 15:39:46', '2026-03-31 15:31:27', NULL, NULL, NULL, 1),
(25, 'kajal singh', 'Female', 'kajalkajal0693@gmail.com', '$2y$10$VsCZ.m2j6H45Y.UlzczdEeM47Uc2DIzpP7kmSRxl7rTVyFR8cVxdy', 'student', '2026-04-11 08:18:07', '2026-04-11 08:20:28', NULL, NULL, NULL, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_id` (`exam_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_feedback_user` (`student_id`);

--
-- Indexes for table `help_requests`
--
ALTER TABLE `help_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_help_user` (`student_id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_id` (`exam_id`);

--
-- Indexes for table `student_answers`
--
ALTER TABLE `student_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attempt_id` (`attempt_id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `help_requests`
--
ALTER TABLE `help_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `student_answers`
--
ALTER TABLE `student_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD CONSTRAINT `exam_attempts_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `fk_feedback_user` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `help_requests`
--
ALTER TABLE `help_requests`
  ADD CONSTRAINT `fk_help_user` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_answers`
--
ALTER TABLE `student_answers`
  ADD CONSTRAINT `student_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
