import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  //Timer state
  const [timer, setTimer] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  //Send OTP
  const sendOtp = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter email");
      setMessage("");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth.php?action=send-otp", {
        email: cleanEmail,
      });

      setMessage(res.data.message || "OTP sent successfully");
      setError("");
      setStep(2);
      setTimer(30); // start timer
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  //Resend OTP
  const resendOtp = async () => {
    if (timer > 0) return;

    try {
      setLoading(true);

      await api.post("/auth.php?action=send-otp", {
        email: email.trim(),
      });

      setMessage("OTP resent successfully");
      setError("");
      setTimer(30);
    } catch (err) {
      setError("Failed to resend OTP");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async () => {
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();
    const cleanPassword = password.trim();

    if (!cleanOtp || !cleanPassword) {
      setError("All fields required");
      setMessage("");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth.php?action=verify-otp", {
        email: cleanEmail,
        otp: cleanOtp,
        password: cleanPassword,
      });

      setShowPopup(true);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Forgot Password</h2>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button style={styles.button} onClick={sendOtp}>
              {loading ? "Sending..." : "Send OTP"}
            </button>

            {/*Cancel Button */}
            <button
              style={{
                ...styles.button,
                marginTop: "10px",
                background: "#dc3545",
              }}
              onClick={() => navigate("/login")}
            >
              Cancel
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input style={styles.input} value={email} disabled />

            <input
              style={styles.input}
              type="number"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <input
              style={styles.input}
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button style={styles.button} onClick={resetPassword}>
              {loading ? "Processing..." : "Reset Password"}
            </button>

            {/*Resend OTP */}
            <button
              style={{
                ...styles.button,
                marginTop: "10px",
                background: timer > 0 ? "#ccc" : "#28a745",
              }}
              onClick={resendOtp}
              disabled={timer > 0}
            >
              {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
            </button>

            {/*Cancel Button */}
            <button
              style={{
                ...styles.button,
                marginTop: "10px",
                background: "#dc3545",
              }}
              onClick={() => navigate("/login")}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/*POPUP */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <h3>✅ Success</h3>
            <p>Password reset successfully</p>
            <button style={styles.popupBtn} onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #fff)",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid blue",
    width: "360px",
    boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#4facfe",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  success: {
    background: "#d4edda",
    color: "#155724",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
  },
  error: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    textAlign: "center",
    width: "300px",
  },
  popupBtn: {
    marginTop: "15px",
    padding: "10px",
    background: "#4facfe",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};