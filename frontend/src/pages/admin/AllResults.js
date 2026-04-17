// frontend/src/pages/admin/AllResults.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAttempts, getExams } from "../../utils/api";

export default function AllResults() {
  const [attempts, setAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAllAttempts(), getExams()])
      .then(([a, e]) => {
        setAttempts(a.data);
        setExams(e.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = attempts.filter((a) => {
    const score = Number(a.score ?? 0);
    const passMarks = Number(a.pass_marks ?? 0);
    const status = a.status?.toLowerCase().trim();

    const isPassed = score >= passMarks;

    if (examFilter && a.exam_id != examFilter) return false;

    if (filter === "passed") return status === "completed" && isPassed;
    if (filter === "failed") return status === "completed" && !isPassed;
    if (filter === "in_progress") return status === "in_progress";
    if (examFilter && a.exam_id != examFilter) return false;
    return true;
  });

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );

  const completed = attempts.filter((a) => a.status === "completed");
  const passRate = completed.length
    ? Math.round(
        (completed.filter((a) => Number(a.score) >= Number(a.pass_marks))
          .length /
          completed.length) *
          100,
      )
    : 0;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">All Results</h1>
        <p className="page-sub">
          Complete examination results across all students
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card blue">
          <div className="stat-label">Total Attempts</div>
          <div className="stat-value">{attempts.length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Pass Rate</div>
          <div className="stat-value">{passRate}%</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completed.length}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">
            {attempts.filter((a) => a.status === "in_progress").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <select
          className="form-input"
          style={{ width: "auto", minWidth: 160 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Results</option>
          <option value="passed">Passed Only</option>
          <option value="failed">Failed Only</option>
          <option value="in_progress">In Progress</option>
        </select>
        <select
          className="form-input"
          style={{ width: "auto", minWidth: 200 }}
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
        >
          <option value="">All Exams</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
        <span
          style={{ color: "var(--text2)", fontSize: 13, alignSelf: "center" }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Score</th>
              <th>%</th>
              <th>Status</th>
              <th>Started</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    color: "var(--text2)",
                    padding: 32,
                  }}
                >
                  No results found
                </td>
              </tr>
            ) : (
              filtered.map((a) => {
                const pct = a.total_marks
                  ? Math.round((a.score / a.total_marks) * 100)
                  : 0;
                const score = Number(a.score);
                const passMarks = Number(a.pass_marks);
                const passed =
                  a.status === "completed" && score >= a.pass_marks;
                return (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.student_name}</div>
                      <div style={{ fontSize: 12, color: "var(--text2)" }}>
                        {a.student_email}
                      </div>
                    </td>
                    <td
                      style={{
                        fontSize: 13,
                        color: "var(--text2)",
                        maxWidth: 180,
                      }}
                    >
                      {a.exam_title}
                    </td>
                    <td>
                      <span
                        style={{ fontFamily: "Space Mono", fontWeight: 700 }}
                      >
                        {a.score || 0}/{a.total_marks}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          minWidth: 100,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 5,
                            background: "var(--border)",
                            borderRadius: 3,
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: passed
                                ? "var(--green)"
                                : "var(--red)",
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            minWidth: 32,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {a.status === "completed" ? (
                        <span
                          className={`badge ${passed ? "badge-green" : "badge-red"}`}
                        >
                          {passed ? "✓ Passed" : "✗ Failed"}
                        </span>
                      ) : (
                        <span className="badge badge-yellow">In Progress</span>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text2)" }}>
                      {new Date(a.start_time).toLocaleString()}
                    </td>
                    <td>
                      {a.status?.toLowerCase() === "completed" && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/admin/result/${a.id}`)}
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
