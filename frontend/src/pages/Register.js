// frontend/src/pages/Register.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // loginUser
  const { loginUser } = useAuth();

  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // register API cal
      await register(form.name, form.email, form.password, form.gender);

      // redirect on dashboard + OTP flow trigger
      localStorage.setItem("email", form.email);
      navigate("/verify-otp", {
        state: { email: form.email },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Online Examination</div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Join thousands of students on our platform</p>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={set("name")}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-input"
              value={form.gender}
              onChange={set("gender")}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              type="password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Confirm password"
              required
            />
          </div>

          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16 }} />
                Creating...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            color: "var(--text2)",
            fontSize: 14,
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--accent2)", fontWeight: 600 }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
