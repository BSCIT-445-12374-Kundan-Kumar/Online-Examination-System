// frontend/src/pages/VerifyOTP.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyRegisterOtp, resendOtp } from "../utils/api";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || localStorage.getItem("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showPopup, setShowPopup] = useState(false);

  // redirect if no email
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  // timer logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // handle OTP input
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const finalOtp = otp.join("");

  // verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (finalOtp.length !== 6) {
      setError("Enter complete OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await verifyRegisterOtp(email, Number(finalOtp));

      if (res.data && !res.data.error) {
        setShowPopup(true); // popup show
      } else {
        setError("Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // resend OTP
  const handleResend = async () => {
    setError("");

    try {
      await resendOtp(email);
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Online Examination</div>
        <h2 className="auth-title">Verify OTP</h2>
        <p className="auth-sub">Enter the OTP sent to your email</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleVerify}>
          {/* OTP BOXES */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                maxLength={1}
                style={{
                  width: 40,
                  height: 45,
                  textAlign: "center",
                  fontSize: 18,
                  borderRadius: 5,
                  border: "1px solid #ccc",
                }}
              />
            ))}
          </div>

          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* RESEND BUTTON */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={handleResend}
            disabled={timer > 0}
            style={{
              background: "none",
              border: "none",
              color: timer > 0 ? "gray" : "var(--accent2)",
              cursor: timer > 0 ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
          </button>
        </div>

        {/* SUCCESS POPUP */}
        {showPopup && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 style={{ marginBottom: 10 }}>Success</h3>
              <p>Email verified successfully. You can now login.</p>

              <button
                className="btn btn-primary"
                onClick={() => navigate("/login")}
                style={{ marginTop: 15 }}
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
