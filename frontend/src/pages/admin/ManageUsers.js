// frontend/src/pages/admin/ManageUsers.js
import React, { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../../utils/api";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () =>
    getUsers()
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`))
      return;
    await deleteUser(id);
    load();
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );

  const students = users.filter((u) => u.role === "student").length;
  const admins = users.filter((u) => u.role === "admin").length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
        <p className="page-sub">{users.length} total users</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card blue">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Students</div>
          <div className="stat-value">{students}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Admins</div>
          <div className="stat-value">{admins}</div>
        </div>
      </div>

      <div className="mb-4">
        <input
          className="form-input"
          style={{ maxWidth: 400 }}
          placeholder="🔍  Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    color: "var(--text2)",
                    padding: 32,
                  }}
                >
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        className="avatar"
                        style={{ width: 32, height: 32, fontSize: 12 }}
                      >
                        {u.name[0].toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                    </div>
                  </td>
                  <td style={{ color: "var(--text2)", fontSize: 13 }}>
                    {u.email}
                  </td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {u.gender
                        ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1)
                        : "-"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${u.role === "admin" ? "badge-yellow" : "badge-blue"}`}
                    >
                      {u.role === "admin" ? "Admin" : "Student"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text2)", fontSize: 13 }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {u.role !== "admin" && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u.id, u.name)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
