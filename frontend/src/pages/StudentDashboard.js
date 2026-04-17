// frontend/src/pages/StudentDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExams, getMyAttempts } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getExams(), getMyAttempts()])
      .then(([e, a]) => {
        setExams(e.data);
        setAttempts(a.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const completed = attempts.filter((a) => a.status === "completed").length;
  const avgScore = attempts.length
    ? Math.round(
        attempts.reduce((s, a) => s + (a.score / a.total_marks) * 100, 0) /
          attempts.filter((a) => a.status === "completed").length || 0,
      )
    : 0;

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Hello, {user?.name?.split(" ")[0]}</h1>
        <p className="page-sub">Here's your learning overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-label">Available Exams</div>
          <div className="stat-value">{exams.length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completed}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Avg Score</div>
          <div className="stat-value">
            {completed > 0 ? avgScore + "%" : "--"}
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{exams.length - completed}</div>
        </div>
      </div>

      <div className="flex-between mb-4">
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Available Exams</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/exams")}
        >
          View All →
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No exams available</div>
        </div>
      ) : (
        <div className="exam-grid">
          {exams.slice(0, 6).map((exam) => {
            const done = exam.my_status === "completed";
            return (
              <div className="exam-card" key={exam.id}>
                <div className="exam-subject">{exam.subject}</div>
                <div className="exam-title">{exam.title}</div>
                <div className="exam-desc">{exam.description}</div>
                <div className="exam-meta">
                  <span className="meta-chip">
                    ⏱ {exam.duration_minutes} min
                  </span>
                  <span className="meta-chip">📝 {exam.question_count} Qs</span>
                  <span className="meta-chip">🏆 {exam.total_marks} marks</span>
                </div>
                {done ? (
                  <div className="flex gap-2">
                    <span className="badge badge-green">✓ Completed</span>
                    <span className="badge badge-blue">
                      {exam.my_score}/{exam.total_marks}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/result/${exam.attempt_id}`)}
                    >
                      Review
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/exam/${exam.id}`)}
                  >
                    Start Exam →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
