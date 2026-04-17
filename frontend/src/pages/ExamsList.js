// frontend/src/pages/ExamsList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExams } from "../utils/api";

export default function ExamsList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getExams()
      .then((r) => setExams(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.subject || "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading exams...</span>
      </div>
    );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Available Exams</h1>
        <p className="page-sub">
          {exams.length} exam{exams.length !== 1 ? "s" : ""} available for you
        </p>
      </div>

      <div className="mb-6">
        <input
          className="form-input"
          style={{ maxWidth: 400 }}
          placeholder="🔍  Search exams by title or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No exams found</div>
          <p className="text-muted">Try a different search term</p>
        </div>
      ) : (
        <div className="exam-grid">
          {filtered.map((exam) => {
            const done = exam.my_status === "completed";
            const inProgress = exam.my_status === "in_progress";
            return (
              <div className="exam-card" key={exam.id}>
                <div className="exam-subject">{exam.subject || "General"}</div>
                <div className="exam-title">{exam.title}</div>
                <div className="exam-desc">
                  {exam.description || "No description provided."}
                </div>
                <div className="exam-meta">
                  <span className="meta-chip">
                    ⏱ {exam.duration_minutes} min
                  </span>
                  <span className="meta-chip">📝 {exam.question_count} Qs</span>
                  <span className="meta-chip">🏆 {exam.total_marks} marks</span>
                  <span className="meta-chip">✅ Pass: {exam.pass_marks}</span>
                </div>
                <div className="exam-actions">
                  {done ? (
                    <>
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
                    </>
                  ) : inProgress ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/exam/${exam.id}`)}
                    >
                      Resume →
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/exam/${exam.id}`)}
                    >
                      Start Exam →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
