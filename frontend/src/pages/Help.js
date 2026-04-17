import React, { useState, useEffect } from "react";
import api from "../utils/api";

export default function Help() {
  const [form, setForm] = useState({
    subject: "",
    message: "",
    type: "technical",
    other: "",
  });

  const [requests, setRequests] = useState([]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const loadRequests = () => {
    api.get("/help.php?action=my").then((res) => setRequests(res.data));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = async () => {
    if (!form.subject || !form.message) return alert("Fill all fields");

    await api.post("/help.php?action=add", form);
    alert("Request submitted");

    setForm({ subject: "", message: "", type: "technical", other: "" });
    loadRequests();
  };

  const getStatusClass = (status) => {
    if (status === "resolved") return "badge-green";
    if (status === "in_progress") return "badge-yellow";
    return "badge-red";
  };

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-header">
        <h1 className="page-title">🆘 Help & Support</h1>
        <p className="page-sub">Raise your issue or suggestion</p>
      </div>

      {/* FORM CARD */}
      <div className="card" style={{ maxWidth: 600, marginBottom: 30 }}>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select
            className="form-input"
            value={form.type}
            onChange={set("type")}
          >
            <option value="technical">⚙️ Technical</option>
            <option value="exam">📝 Exam</option>
            <option value="account">🔐 Account</option>
            <option value="suggestion">💡 Suggestion</option>
            <option value="other">📌 Other</option>
          </select>
        </div>

        {form.type === "other" && (
          <div className="form-group">
            <label className="form-label">Specify</label>
            <input
              className="form-input"
              value={form.other}
              onChange={set("other")}
              placeholder="Please specify..."
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Subject</label>
          <input
            className="form-input"
            value={form.subject}
            onChange={set("subject")}
            placeholder="Short title..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="form-input"
            rows={4}
            value={form.message}
            onChange={set("message")}
            placeholder="Describe your issue..."
          />
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSubmit}>
          Submit Request
        </button>
      </div>

      {/* REQUEST LIST */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>📋 My Requests</h3>

        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div>No requests yet</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="badge badge-blue">{r.type}</span>
                    </td>

                    <td style={{ fontWeight: 500 }}>{r.subject}</td>

                    <td>
                      <span className={`badge ${getStatusClass(r.status)}`}>
                        {r.status}
                      </span>
                    </td>

                    <td style={{ color: "var(--text2)" }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
