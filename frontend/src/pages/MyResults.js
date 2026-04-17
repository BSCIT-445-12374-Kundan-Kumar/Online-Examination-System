// frontend/src/pages/MyResults.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyAttempts } from '../utils/api';
import jsPDF from "jspdf";

export default function MyResults() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyAttempts()
      .then(r => setAttempts(r.data))
      .finally(() => setLoading(false));
  }, []);

  // 🎓 Certificate Function
  const downloadCertificate = (a) => {
    const doc = new jsPDF();

    doc.rect(10, 10, 190, 270);

    doc.setFontSize(22);
    doc.text("CERTIFICATE OF ACHIEVEMENT", 105, 30, { align: "center" });

    doc.setFontSize(14);
    doc.text("This is to certify that", 105, 50, { align: "center" });

    doc.setFontSize(18);
    doc.text(a.student_name || "Student", 105, 65, { align: "center" });

    doc.setFontSize(14);
    doc.text("has successfully passed", 105, 80, { align: "center" });

    doc.setFontSize(16);
    doc.text(a.title, 105, 95, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Subject: ${a.subject}`, 105, 105, { align: "center" });

    doc.text(`Score: ${a.score}/${a.total_marks}`, 105, 115, { align: "center" });

    doc.text(`Date: ${new Date(a.start_time).toLocaleDateString()}`, 105, 125, { align: "center" });

    doc.setFontSize(10);
    doc.text("Online Examination System", 105, 150, { align: "center" });

    doc.save("certificate.pdf");
  };

  if (loading) return <div className="loading"><div className="spinner"/><span>Loading...</span></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My Results</h1>
        <p className="page-sub">View your exam results and download certificate</p>
      </div>

      {attempts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No exams taken yet</div>
          <button className="btn btn-primary" onClick={() => navigate('/exams')}>
            Browse Exams
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Subject</th>
                <th>Score</th>
                <th>%</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {attempts.map(a => {
                const pct = a.total_marks ? Math.round((a.score / a.total_marks) * 100) : 0;
                const passed = Number(a.score) >= Number(a.pass_marks);

                return (
                  <tr key={a.id}>
                    <td><b>{a.title}</b></td>
                    <td>{a.subject}</td>
                    <td>{a.score}/{a.total_marks}</td>
                    <td>{pct}%</td>

                    <td>
                      <span className={`badge ${passed ? 'badge-green' : 'badge-red'}`}>
                        {passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>

                    <td>{new Date(a.start_time).toLocaleDateString()}</td>

                    <td style={{ display: 'flex', gap: 8 }}>
                      
                      {/*VIEW BUTTON */}
                      {a.status === 'completed' && (
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/result/${a.id}`)}
                        >
                          View →
                        </button>
                      )}

                      {/*CERTIFICATE */}
                      {a.status === 'completed' && passed && (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => downloadCertificate(a)}
                        >
                          🎓 Certificate
                        </button>
                      )}

                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      )}
    </>
  );
}