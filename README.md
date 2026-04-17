# Online Examination System

## Project Description

The Online Examination System is a web-based application developed using React for the frontend and PHP for the backend, with MySQL as the database. This system enables students to take exams online, view their results, and interact with support features. It also provides administrative functionalities to manage exams, monitor student activities, and handle user feedback efficiently.

---

## Tech Stack

* Frontend: React.js
* Backend: PHP
* Database: MySQL
* Server: Apache (XAMPP/LAMP)

---

## Key Features

### Student Features

* User Registration and Login
* Secure Forgot Password with Email-based OTP verification
* View available exams
* Attempt exams with time limit
* Submit answers
* Automatic result calculation
* View results and scores
* Submit feedback
* Raise help/support requests

### Admin Features

* Create and manage exams
* Set duration, total marks, and passing criteria
* Monitor student exam attempts
* View feedback and support requests

---

## Authentication System

The system implements a secure authentication mechanism including:

* Login and registration system
* Password reset using Email-based OTP verification
* Validation and secure access control

---

## Database Structure

### exams

Stores exam-related information:

* title
* subject
* duration
* total_marks
* pass_marks
* start_time
* end_time

### exam_attempts

Tracks student exam activity:

* exam_id
* student_id
* score
* total_marks
* status (in_progress, completed, timed_out)

### feedback

Stores user feedback:

* student_id
* message
* rating

### help_requests

Handles user issues and support:

* subject
* message
* type (technical, exam, account, etc.)
* status (pending, resolved, etc.)

---

## Installation and Setup

### 1. Clone the Repository

git clone https://github.com/BSCIT-445-12374-Kundan-Kumar/Online-Examination-System.git

---

### 2. Frontend Setup

cd frontend
npm install
npm start

---

### 3. Backend Setup

* Move the backend folder to:
  C:/xampp/htdocs/
* Start Apache and MySQL using XAMPP

---

### 4. Database Setup

* Open phpMyAdmin
* Create a database named: online_exam_db
* Import the provided SQL file

---

## Usage

* Open the frontend in a browser
* Register or log in
* Use OTP verification for password reset if needed
* Select an exam
* Attempt the exam within the given time
* Submit answers and view results

---

## Project Structure

* frontend/ : React application
* backend/ : PHP APIs
* database/ : SQL file

---

## System Functionalities

* Time-based examination system
* Automatic evaluation and result generation
* Secure authentication with OTP verification
* Feedback and support management system
* Multi-exam handling capability

---

## Author

Kundan Kumar

---

## Future Improvements

* Two-factor authentication (2FA)
* Real-time exam monitoring
* Leaderboard and ranking system
* Email notifications for results and updates
