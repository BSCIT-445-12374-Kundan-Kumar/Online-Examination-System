// frontend/src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getExams, getAllAttempts } from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getStats(), getAllAttempts(), getExams()])
      .then(([s, a, e]) => {
        setStats(s.data);
        setRecentAttempts(a.data.slice(0, 8));
        setExams(e.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"/><span>Loading...</span></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-sub">Manage Examination</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{stats.total_users || 0}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Total Exams</div>
          <div className="stat-value">{stats.total_exams || 0}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Attempts</div>
          <div className="stat-value">{stats.total_attempts || 0}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Avg Score</div>
          <div className="stat-value">{stats.avg_score || 0}%</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/admin/exams')}>+ Create Exam</button>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/users')}>👥 Manage Users</button>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/results')}>📊 View All Results</button>
        </div>
      </div>

      {/* Exam Summary Table */}
      <div className="mb-6">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Exams Overview</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/exams')}>Manage →</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Exam</th><th>Subject</th><th>Questions</th><th>Attempts</th><th>Duration</th><th>Status</th></tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text2)', padding: 32 }}>No exams yet</td></tr>
              ) : exams.map(e => (
                <tr key={e.id}>
                  <td><div style={{ fontWeight: 600 }}>{e.title}</div></td>
                  <td><span className="badge badge-blue">{e.subject || '—'}</span></td>
                  <td style={{ fontFamily: 'Space Mono' }}>{e.question_count}</td>
                  <td style={{ fontFamily: 'Space Mono' }}>{e.attempt_count}</td>
                  <td style={{ color: 'var(--text2)' }}>{e.duration_minutes} min</td>
                  <td>
                    <span className={`badge ${e.is_active ? 'badge-green' : 'badge-red'}`}>
                      {e.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attempts */}
      <div>
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recent Attempts</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/results')}>All →</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Exam</th><th>Score</th><th>Result</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {recentAttempts.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text2)', padding: 32 }}>No attempts yet</td></tr>
              ) : recentAttempts.map(a => {
                const pct = a.total_marks ? Math.round((a.score / a.total_marks) * 100) : 0;
                const passed = a.score >= a.pass_marks;
                return (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.student_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{a.student_email}</div>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{a.exam_title}</td>
                    <td>
                      <span style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{a.score}/{a.total_marks}</span>
                      <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 6 }}>{pct}%</span>
                    </td>
                    <td>
                      {a.status === 'completed'
                        ? <span className={`badge ${passed ? 'badge-green' : 'badge-red'}`}>{passed ? 'Passed' : 'Failed'}</span>
                        : <span className="badge badge-yellow">In Progress</span>}
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{new Date(a.start_time).toLocaleDateString()}</td>
                    <td>
                      {a.status === 'completed' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/result/${a.id}`)}>View</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
