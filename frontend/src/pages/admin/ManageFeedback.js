import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function ManageFeedback() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/feedback.php?action=list')
      .then(res => setData(res.data));
  }, []);

  const shortText = (text, max = 40) => {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '...' : text;
  };

  return (
    <div className="page">

      <div className="page-header">
        <h1 className="page-title">Feedback</h1>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Message</th>
              <th>Rating</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 30 }}>
                  No feedback
                </td>
              </tr>
            ) : data.map(f => (
              <tr key={f.id}>

                <td>
                  <div>{f.name}</div>
                  <small>{f.email}</small>
                </td>

                <td>
                  {shortText(f.message)}
                  {f.message.length > 40 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ marginLeft: 8 }}
                      onClick={() => setSelected(f)}
                    >
                      View
                    </button>
                  )}
                </td>

                <td>⭐ {f.rating}</td>

                <td>{new Date(f.created_at).toLocaleDateString()}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            <h3 style={{ marginBottom: 10 }}>Full Feedback</h3>

            <div style={{ marginBottom: 10 }}>
              <strong>{selected.name}</strong> ({selected.email})
            </div>

            <div style={{
              padding: 12,
              background: 'var(--bg3)',
              borderRadius: 8,
              whiteSpace: 'pre-wrap'
            }}>
              {selected.message}
            </div>

            <div style={{ marginTop: 10 }}>
              ⭐ Rating: {selected.rating}
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}