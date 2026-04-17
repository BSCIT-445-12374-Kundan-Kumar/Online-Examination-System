import React, { useEffect, useState } from 'react';
import { getExams, getExamReport } from '../../utils/api';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Reports() {
  const [report, setReport] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExams().then(res => setExams(res.data)).finally(() => setLoading(false));
  }, []);

  const fetchReport = (examId) => {
    setLoading(true);
    getExamReport(examId)
      .then(res => setReport(res.data))
      .finally(() => setLoading(false));
  };

  // ================= PDF =================
  const downloadPDF = () => {
    const doc = new jsPDF();

    const examTitle = report[0]?.exam_title || "Exam";
    const subject = report[0]?.subject || "";

    // Heading
    doc.setFontSize(16);
    doc.text(`Exam: ${examTitle}`, 14, 10);

    doc.setFontSize(12);
    doc.text(`Subject: ${subject}`, 14, 18);

    const tableData = report.map(r => [
      r.student_name,
      r.gender,
      r.student_email,
      r.exam_title,
      `${r.score}/${r.total_marks}`,
      r.percentage + "%",
      r.status
    ]);

    autoTable(doc, {
      startY: 25,
      head: [["Student","Gender", "Email", "Exam", "Score", "%", "Status"]],
      body: tableData,
    });

    doc.save("report.pdf");
  };

  // ================= EXCEL =================
  const downloadExcel = () => {
    const examTitle = report[0]?.exam_title || "Exam";
    const subject = report[0]?.subject || "";

    const formattedData = report.map(r => ({
      Student: r.student_name,
      Gender: r.gender,
      Email: r.student_email,
      Exam: r.exam_title,
      Score: `${r.score}/${r.total_marks}`,
      Percentage: r.percentage + "%",
      Status: r.status
    }));

    const worksheet = XLSX.utils.json_to_sheet([
      { A: `Exam: ${examTitle}` },
      { A: `Subject: ${subject}` },
      {},
      ...formattedData
    ], { skipHeader: false });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "report.xlsx");
  };

  // ================= UI =================
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Exam Report</h1>
        <p className="page-sub">Student performance report exam-wise</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          className="form-input"
          style={{ minWidth: 200 }}
          value={selectedExam}
          onChange={(e) => {
            setSelectedExam(e.target.value);
            fetchReport(e.target.value);
          }}
        >
          <option value="">Select Exam</option>
          {exams.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>

        <button className="btn btn-ghost" onClick={downloadPDF}>📄 PDF</button>
        <button className="btn btn-ghost" onClick={downloadExcel}>💹 Excel</button>

        <span style={{ color: 'var(--text2)', fontSize: 13, alignSelf: 'center' }}>
          {report.length} record{report.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Gender</th>
              <th>Exam</th>
              <th>Score</th>
              <th>%</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {report.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                  No report data
                </td>
              </tr>
            ) : report.map((r, i) => {
              const passed = r.status === 'Pass';
              return (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.student_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{r.student_email}</div>
                  </td>
                  <td style={{color: 'var(--text2)' }}>{r.gender}</td>
                  <td style={{ color: 'var(--text2)' }}>{r.exam_title}</td>
                  <td>
                    <span style={{ fontWeight: 700 }}>
                      {r.score}/{r.total_marks}
                    </span>
                  </td>
                  <td>{r.percentage}%</td>
                  <td>
                    <span className={`badge ${passed ? 'badge-green' : 'badge-red'}`}>
                      {passed ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}