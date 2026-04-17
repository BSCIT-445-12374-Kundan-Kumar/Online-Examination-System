import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Feedback() {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [history, setHistory] = useState([]);

  const loadHistory = () => {
    api.get('/feedback.php?action=my')
      .then(res => setHistory(res.data));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const submit = async () => {
    if (!message) return alert("Enter message");

    await api.post('/feedback.php?action=add', { message, rating });

    setMessage('');
    setRating(5);

    loadHistory();
  };

  return (
    <div className="page">

      <div className="page-header">
        <h1 className="page-title">Feedback</h1>
      </div>

      {/* FORM */}
      <div className="card" style={{ maxWidth: 500, marginBottom: 30 }}>

        <div className="form-group">
          <label>Message</label>
          <textarea
            className="form-input"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your feedback..."
          />
        </div>

        <div className="form-group">
          <label>Rating</label>
          <select className="form-input" value={rating} onChange={e => setRating(e.target.value)}>
            <option value={5}>⭐⭐⭐⭐⭐</option>
            <option value={4}>⭐⭐⭐⭐</option>
            <option value={3}>⭐⭐⭐</option>
            <option value={2}>⭐⭐</option>
            <option value={1}>⭐</option>
          </select>
        </div>

        

        <button className="btn btn-primary" onClick={submit}>
          Submit Feedback
        </button>
      </div>

      {/* HISTORY */}
      <div className="card">
        <h3 style={{ marginBottom: 15 }}>My Feedback History</h3>

        {history.length === 0 ? (
          <div>No feedback yet</div>
        ) : history.map((f, i) => (
          <div key={i} style={{
            padding: 12,
            borderBottom: '1px solid #eee'
          }}>
            <div style={{ fontSize: 14, marginBottom: 5 }}>
              ⭐ {f.rating}
            </div>

            <div style={{ marginBottom: 5 }}>
              {f.message}
            </div>

            <div style={{ fontSize: 12, color: '#888' }}>
              {new Date(f.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}