// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../utils/api';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showResend, setShowResend] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await login(email, password);
      loginUser(res.data.user, res.data.token);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');

    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password';

      setError(msg);

      //show OTP flow
      if (msg.toLowerCase().includes("verify your email")) {
        setShowResend(true);
        setShowOtpInput(true);
      } else {
        setShowResend(false);
        setShowOtpInput(false);
      }

    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      await api.post('/auth.php?action=resend-otp', { email });

      setMessage("OTP resent to your email");

    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      await api.post('/auth.php?action=verify-register-otp', {
        email,
        otp
      });

      setMessage("Email verified successfully. Please login.");

      setShowOtpInput(false);
      setShowResend(false);
      setOtp('');

    } catch (err) {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Online Examination</div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to your account to continue</p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <><div className="spinner" style={{width:16,height:16}} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        {/*OTP INPUT */}
        {showOtpInput && (
          <>
            <input
              className="form-input"
              type="number"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              style={{ marginTop: "12px" }}
            />

            <button
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "10px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "6px"
              }}
              onClick={handleVerifyOTP}
            >
              Verify OTP
            </button>
          </>
        )}

        {/*RESEND OTP */}
        {showResend && (
          <button
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "10px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
            onClick={handleResendOTP}
          >
            Resend OTP
          </button>
        )}

        <div style={{textAlign:'center',marginTop:24,color:'var(--text2)',fontSize:14}}>
          No account? <Link to="/register" style={{color:'var(--accent2)',fontWeight:600}}>Register here</Link>
        </div>

        <div style={{textAlign:'center',marginTop:24,color:'var(--text2)',fontSize:14}}>
          Forgot Password? <Link to="/forgot-password" style={{color:'var(--accent2)',fontWeight:600}}>Forget Password</Link>
        </div>

      </div>
    </div>
  );
}