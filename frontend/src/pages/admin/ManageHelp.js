import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function ManageHelp() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    api.get(`/help.php?action=list&status=${status}&type=${type}&search=${search}`)
      .then(res => setData(res.data));
  };

  useEffect(() => {
    const delay = setTimeout(load, 300);
    return () => clearTimeout(delay);
  }, [status, type, search]);

  const updateStatus = async (id, value) => {
    await api.put(`/help.php?action=update&id=${id}`, { status: value });
    load();
  };

  const getStatusColor = (status) => {
    if (status === 'pending') return '#ef4444';
    if (status === 'in_progress') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="page">

      <div className="page-header">
        <h1 className="page-title">Help Requests</h1>
      </div>

      {/* FILTER */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Type</option>
          <option value="technical">Technical</option>
          <option value="exam">Exam</option>
          <option value="account">Account</option>
          <option value="suggestion">Suggestion</option>
          <option value="other">Other</option>
        </select>

        <input
          className="form-input"
          placeholder="Search Name, Email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map(r => (
              <tr key={r.id}>

                <td>
                  <strong>{r.name}</strong><br/>
                  <small>{r.email}</small>
                </td>

                <td>{r.type}</td>
                <td>{r.subject}</td>

                {/* STATUS DROPDOWN */}
                <td>
                  <select
                    className="status-dropdown"
                    value={r.status}
                    onChange={e => updateStatus(r.id, e.target.value)}
                    style={{ borderColor: getStatusColor(r.status) }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}