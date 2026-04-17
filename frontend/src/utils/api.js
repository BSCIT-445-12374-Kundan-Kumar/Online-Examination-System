// frontend/src/utils/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:88/backend/api';

const api = axios.create({ baseURL: BASE_URL,
  headers:{
    'Content-Type': 'application/json'
  }
 });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 &&
      !err.config.url.includes('auth.php?action=login')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (email, password) => api.post('/auth.php?action=login', { email, password });

export const register = (name, email, password, gender) => api.post('/auth.php?action=register', { name, email, password,gender });
export const getMe = () => api.get('/auth.php?action=me');

export const getStudentReport = (examId, studentId) => api.get(`/report.php?action=student_report&exam_id=${examId}&student_id=${studentId}`);

export const verifyRegisterOtp = (email, otp) => {
  return api.post('/auth.php?action=verify-register-otp', { email, otp });
};

export const resendOtp = (email) => {
  return api.post('/auth.php?action=resend-otp', { email });
};

// Exams
export const getExams = () => api.get('/exams.php?action=list');
export const getExam = (id) => api.get(`/exams.php?action=get&id=${id}`);
export const createExam = (data) => api.post('/exams.php?action=create', data);
export const updateExam = (id, data) => api.put(`/exams.php?action=update&id=${id}`, data);
export const deleteExam = (id) => api.delete(`/exams.php?action=delete&id=${id}`);
export const getExamQuestions = (id) => api.get(`/exams.php?action=questions&id=${id}`);
export const addQuestion = (data) => api.post('/exams.php?action=add_question', data);
export const deleteQuestion = (id) => api.delete(`/exams.php?action=delete_question&id=${id}`);

// Attempts
export const startAttempt = (examId) => api.post('/attempts.php?action=start', { exam_id: examId });
export const submitAttempt = (attemptId, answers) => api.post('/attempts.php?action=submit', { attempt_id: attemptId, answers });
export const getResult = (id) => api.get(`/attempts.php?action=result&id=${id}`);
export const getMyAttempts = () => api.get('/attempts.php?action=my_attempts');
export const getAllAttempts = (examId) => api.get(`/attempts.php?action=all${examId ? `&id=${examId}` : ''}`);

// Users
export const getUsers = () => api.get('/users.php?action=list');
export const getStats = () => api.get('/users.php?action=stats');
export const deleteUser = (id) => api.delete(`/users.php?action=delete&id=${id}`);
export const getExamReport = (id) => api.get(`/report.php?action=exam_report&id=${id}`);

export default api;
