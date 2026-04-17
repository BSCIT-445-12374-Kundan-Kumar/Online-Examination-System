// frontend/src/pages/admin/ManageExams.js
import React, { useEffect, useState } from "react";
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  getExamQuestions,
  addQuestion,
  deleteQuestion,
} from "../../utils/api";

const emptyExam = {
  title: "",
  description: "",
  subject: "",
  duration_minutes: 60,
  total_marks: 100,
  pass_marks: 40,
  is_active: 1,
};
const emptyQ = {
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
  marks: 1,
};

export default function ManageExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [examForm, setExamForm] = useState(emptyExam);
  const [qForm, setQForm] = useState(emptyQ);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    getExams()
      .then((r) => setExams(r.data))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditExam(null);
    setExamForm(emptyExam);
    setError("");
    setShowExamModal(true);
  };
  const openEdit = (exam) => {
    setEditExam(exam);
    setExamForm({ ...exam });
    setError("");
    setShowExamModal(true);
  };

  const saveExam = async () => {
    setError("");
    setSaving(true);
    try {
      if (editExam) await updateExam(editExam.id, examForm);
      else await createExam(examForm);
      setShowExamModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this exam and all its questions?")) return;
    await deleteExam(id);
    load();
  };

  const openQuestions = async (exam) => {
    setSelectedExam(exam);
    const r = await getExamQuestions(exam.id);
    setQuestions(r.data);
    setQForm({ ...emptyQ, exam_id: exam.id });
  };

  const saveQuestion = async () => {
    setError("");
    setSaving(true);
    try {
      await addQuestion({ ...qForm, exam_id: selectedExam.id });
      const r = await getExamQuestions(selectedExam.id);
      setQuestions(r.data);
      setQForm({ ...emptyQ });
      setShowQModal(false);
    } catch (e) {
      setError(e.response?.data?.error || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQ = async (qid) => {
    if (!window.confirm("Delete this question?")) return;
    await deleteQuestion(qid);
    const r = await getExamQuestions(selectedExam.id);
    setQuestions(r.data);
  };

  const setEF = (k) => (e) => {
    let value = e.target.value;

    if (k === "is_active") {
      value = Number(value);
    }
    setExamForm((f) => ({ ...f, [k]: value }));
  };
  const setQF = (k) => (e) => setQForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );

  return (
    <>
      <div
        className="page-header flex-between"
        style={{ alignItems: "flex-start" }}
      >
        <div>
          <h1 className="page-title">Manage Exams</h1>
          <p className="page-sub">
            {exams.length} exam{exams.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Create Exam
        </button>
      </div>

      {!selectedExam ? (
        /* Exams list */
        exams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No exams yet</div>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Create your first exam to get started
            </p>
            <button className="btn btn-primary" onClick={openCreate}>
              + Create Exam
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Duration</th>
                  <th>Marks</th>
                  <th>Questions</th>
                  <th>Attempts</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{exam.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text2)" }}>
                        {exam.description?.slice(0, 50)}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        {exam.subject || "—"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text2)" }}>
                      {exam.duration_minutes} min
                    </td>
                    <td style={{ fontFamily: "Space Mono" }}>
                      {exam.pass_marks}/{exam.total_marks}
                    </td>
                    <td style={{ fontFamily: "Space Mono" }}>
                      {exam.question_count}
                    </td>
                    <td style={{ fontFamily: "Space Mono" }}>
                      {exam.attempt_count}
                    </td>
                    <td>
                      <span
                        className={`badge ${Number(exam.is_active) === 1 ? "badge-green" : "badge-red"}`}
                      >
                        {Number(exam.is_active) === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openQuestions(exam)}
                        >
                          📝 Questions
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(exam)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(exam.id)}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Questions view */
        <>
          <div className="flex-between mb-6">
            <div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedExam(null)}
                style={{ marginBottom: 8 }}
              >
                ← Back to Exams
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                {selectedExam.title}
              </h2>
              <p className="text-muted">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setQForm({ ...emptyQ });
                setError("");
                setShowQModal(true);
              }}
            >
              + Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">❓</div>
              <div className="empty-title">No questions yet</div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => setShowQModal(true)}
              >
                + Add First Question
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {questions.map((q, i) => (
                <div className="card" key={q.id}>
                  <div className="flex-between" style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "var(--text2)",
                        fontSize: 13,
                      }}
                    >
                      Q{i + 1} • {q.marks} mark{q.marks !== 1 ? "s" : ""}
                    </span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteQ(q.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>
                    {q.question_text}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {["A", "B", "C", "D"].map((opt) => (
                      <div
                        key={opt}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          fontSize: 13,
                          background:
                            q.correct_answer === opt
                              ? "var(--green-glow)"
                              : "var(--bg3)",
                          color:
                            q.correct_answer === opt
                              ? "var(--green)"
                              : "var(--text2)",
                          border: `1px solid ${q.correct_answer === opt ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                        }}
                      >
                        <strong>{opt}.</strong>{" "}
                        {q[`option_${opt.toLowerCase()}`]}
                        {q.correct_answer === opt && (
                          <span style={{ marginLeft: 6 }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Exam Modal */}
      {showExamModal && (
        <div className="modal-overlay" onClick={() => setShowExamModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {editExam ? "Edit Exam" : "Create New Exam"}
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                value={examForm.title}
                onChange={setEF("title")}
                placeholder="Exam title"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                value={examForm.description}
                onChange={setEF("description")}
                rows={3}
                placeholder="Brief description"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                value={examForm.subject}
                onChange={setEF("subject")}
                placeholder="e.g. Mathematics"
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <div className="form-group">
                <label className="form-label">Duration (min)</label>
                <input
                  className="form-input"
                  type="number"
                  value={examForm.duration_minutes}
                  onChange={setEF("duration_minutes")}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Marks</label>
                <input
                  className="form-input"
                  type="number"
                  value={examForm.total_marks}
                  onChange={setEF("total_marks")}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pass Marks</label>
                <input
                  className="form-input"
                  type="number"
                  value={examForm.pass_marks}
                  onChange={setEF("pass_marks")}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={examForm.is_active}
                onChange={setEF("is_active")}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setShowExamModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={saveExam}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editExam
                    ? "Update Exam"
                    : "Create Exam"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQModal && (
        <div className="modal-overlay" onClick={() => setShowQModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Add Question</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Question *</label>
              <textarea
                className="form-input"
                value={qForm.question_text}
                onChange={setQF("question_text")}
                rows={3}
                placeholder="Enter your question here..."
              />
            </div>
            {["a", "b", "c", "d"].map((opt) => (
              <div className="form-group" key={opt}>
                <label className="form-label">
                  Option {opt.toUpperCase()} *
                </label>
                <input
                  className="form-input"
                  value={qForm[`option_${opt}`]}
                  onChange={setQF(`option_${opt}`)}
                  placeholder={`Option ${opt.toUpperCase()}`}
                />
              </div>
            ))}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="form-group">
                <label className="form-label">Correct Answer</label>
                <select
                  className="form-input"
                  value={qForm.correct_answer}
                  onChange={setQF("correct_answer")}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Marks</label>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  value={qForm.marks}
                  onChange={setQF("marks")}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setShowQModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={saveQuestion}
                disabled={saving}
              >
                {saving ? "Saving..." : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
