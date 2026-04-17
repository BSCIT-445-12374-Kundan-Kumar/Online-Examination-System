// frontend/src/pages/Result.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResult } from '../utils/api';

const optLabel = { A: 'a', B: 'b', C: 'c', D: 'd' };

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResult(id).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading"><div className="spinner"/><span>Loading result...</span></div>;
  if (!data) return <div className="empty-state"><div className="empty-icon">❌</div><div className="empty-title">Result not found</div></div>;

  const { attempt, details } = data;
  const pct = Math.round((attempt.score / attempt.total_marks) * 100);
  const passed = attempt.score >= attempt.pass_marks;
  const correct = details.filter(d => d.is_correct == 1).length;
  const wrong = details.filter(d => d.selected_answer && !d.is_correct).length;
  const skipped = details.filter(d => !d.selected_answer).length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Exam Result</h1>
        <p className="page-sub">{attempt.title}</p>
      </div>

      <div className="result-summary">
        <div className={`result-score ${passed ? 'pass' : 'fail'}`}>{pct}%</div>
        <div className="result-label">{attempt.score} / {attempt.total_marks} marks • Pass mark: {attempt.pass_marks}</div>
        <div className={`result-badge ${passed ? 'pass' : 'fail'}`}>{passed ? '🎉 Passed!' : '❌ Failed'}</div>
      </div>

      <div className="stats-grid" style={{marginBottom:32}}>
        <div className="stat-card green"><div className="stat-label">Correct</div><div className="stat-value">{correct}</div></div>
        <div className="stat-card red"><div className="stat-label">Wrong</div><div className="stat-value">{wrong}</div></div>
        <div className="stat-card yellow"><div className="stat-label">Skipped</div><div className="stat-value">{skipped}</div></div>
        <div className="stat-card blue"><div className="stat-label">Score</div><div className="stat-value">{attempt.score}</div></div>
      </div>

      <div className="flex-between mb-4">
        <h2 style={{fontSize:18,fontWeight:700}}>Answer Review</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-results')}>← All Results</button>
      </div>

      <div className="answer-review">
        {details.map((d, i) => {
          const status = !d.selected_answer ? 'skipped' : d.is_correct ? 'correct' : 'wrong';
          return (
            <div key={i} className={`review-item ${status}`}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontWeight:600,fontSize:13,color:'var(--text2)'}}>Q{i+1}</span>
                <span className={`badge ${status === 'correct' ? 'badge-green' : status === 'wrong' ? 'badge-red' : 'badge-yellow'}`}>
                  {status === 'correct' ? '✓ Correct' : status === 'wrong' ? '✗ Wrong' : '— Skipped'}
                </span>
              </div>
              <div style={{fontWeight:600,marginBottom:12}}>{d.question_text}</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {['A','B','C','D'].map(opt => {
                  const isCorrect = d.correct_answer === opt;
                  const isSelected = d.selected_answer === opt;
                  let bg = 'var(--bg3)', color = 'var(--text2)';
                  if (isCorrect) { bg = 'var(--green-glow)'; color = 'var(--green)'; }
                  if (isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; color = 'var(--red)'; }
                  return (
                    <div key={opt} style={{display:'flex',gap:10,padding:'8px 12px',borderRadius:8,background:bg,color}}>
                      <strong>{opt}.</strong>
                      <span>{d[`option_${optLabel[opt]}`]}</span>
                      {isCorrect && <span style={{marginLeft:'auto'}}>✓</span>}
                      {isSelected && !isCorrect && <span style={{marginLeft:'auto'}}>✗</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{marginTop:24,display:'flex',gap:12}}>
        <button className="btn btn-ghost" onClick={() => navigate('/exams')}>Back to Exams</button>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
      </div>
    </>
  );
}
