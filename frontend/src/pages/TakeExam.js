// frontend/src/pages/TakeExam.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getExam,
  getExamQuestions,
  startAttempt,
  submitAttempt,
} from "../utils/api";

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // ✅ T&C
  const [checked, setChecked] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // ✅ Warning
  const [warningCount, setWarningCount] = useState(0);
  const [warningMsg, setWarningMsg] = useState("");

  const timerRef = useRef(null);
  const answersRef = useRef({});

  // Submit
  const doSubmit = useCallback(
    async (aid, ans) => {
      if (!aid || submitting) return;

      setSubmitting(true);
      try {
        const formatted = Object.entries(ans || {}).map(([qid, sel]) => ({
          question_id: parseInt(qid),
          selected_answer: sel,
        }));

        await submitAttempt(aid, formatted);
        navigate(`/result/${aid}`);
      } catch (e) {
        setWarningMsg("Submission failed");
        setSubmitting(false);
      }
    },
    [navigate, submitting],
  );

  // Load exam
  useEffect(() => {
    const init = async () => {
      try {
        const [eRes, qRes] = await Promise.all([
          getExam(id),
          getExamQuestions(id),
        ]);

        setExam(eRes.data);
        setQuestions(qRes.data);

        const aRes = await startAttempt(parseInt(id));
        setAttemptId(aRes.data.attempt_id);

        setTimeLeft(eRes.data.duration_minutes * 60);
      } catch (e) {
        setWarningMsg("Error loading exam");
        navigate("/exams");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, navigate]);

  // TIMER (only after start)
  useEffect(() => {
    if (!attemptId || timeLeft === null || !accepted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          doSubmit(attemptId, answersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [attemptId, accepted]);

  // TAB SWITCH WARNING
  useEffect(() => {
    if (!accepted) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setWarningCount((prev) => {
          const newCount = prev + 1;

          if (newCount >= 3) {
            setWarningMsg("Too many tab switches! Submitting...");
            setTimeout(() => {
              doSubmit(attemptId, answersRef.current);
            }, 1500);
          } else {
            setWarningMsg(`Warning ${newCount}/3: Do not switch tabs`);
          }

          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [accepted, attemptId]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleAnswer = (qid, answer) => {
    setAnswers((prev) => {
      const updated = { ...prev, [qid]: answer };
      answersRef.current = updated;
      return updated;
    });
  };

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading exam...</span>
      </div>
    );
  if (!exam || questions.length === 0)
    return <div className="empty-state">Exam not available</div>;

  // ================= T&C =================
  if (!accepted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Terms & Conditions</h2>

          <ul style={{ textAlign: "left", marginTop: 15 }}>
            <li>Exam cannot be paused</li>
            <li>Do not switch tabs</li>
            <li>3 warnings → auto submit</li>
            <li>Timer will run continuously</li>
          </ul>

          <label>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />{" "}
            I agree to all terms
          </label>

          <button
            className="btn btn-primary btn-full"
            disabled={!checked}
            onClick={() => setAccepted(true)}
            style={{ marginTop: 15 }}
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // ================= ORIGINAL UI =================

  const q = questions[currentQ];
  const progress = (Object.keys(answers).length / questions.length) * 100;
  const isDanger = timeLeft < 120;

  return (
    <div className="exam-taking">
      {/* Header */}
      <div className="exam-header-bar">
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{exam.title}</div>
          <div style={{ color: "var(--text2)", fontSize: 13 }}>
            {questions.length} Questions • {exam.total_marks} Marks
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={`timer ${isDanger ? "danger" : ""}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>
            {Object.keys(answers).length}/{questions.length} answered
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question Nav */}
      <div className="question-nav">
        {questions.map((q, i) => (
          <button
            key={q.id}
            className={`q-btn ${answers[q.id] ? "answered" : ""} ${i === currentQ ? "current" : ""}`}
            onClick={() => setCurrentQ(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <div className="question-card">
        <div className="q-number">
          Question {currentQ + 1} of {questions.length}
        </div>

        <div className="q-text">{q.question_text}</div>

        <div className="options-list">
          {["A", "B", "C", "D"].map((opt) => (
            <div
              key={opt}
              className={`option-item ${answers[q.id] === opt ? "selected" : ""}`}
              onClick={() => handleAnswer(q.id, opt)}
            >
              <div className="option-letter">{opt}</div>
              <div>{q[`option_${opt.toLowerCase()}`]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-between">
        <button
          className="btn btn-ghost"
          onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
          disabled={currentQ === 0}
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {currentQ < questions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentQ((c) => c + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={() => setConfirmSubmit(true)}
            >
              Submit Exam ✓
            </button>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmSubmit && (
        <div className="modal-overlay" onClick={() => setConfirmSubmit(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Submit Exam?</div>

            <p>
              You answered {Object.keys(answers).length}/{questions.length}
            </p>

            <div className="flex gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmSubmit(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                disabled={submitting}
                onClick={() => doSubmit(attemptId, answersRef.current)}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Popup */}
      {warningMsg && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Warning</div>
            <p>{warningMsg}</p>
            <button
              className="btn btn-primary"
              onClick={() => setWarningMsg("")}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
