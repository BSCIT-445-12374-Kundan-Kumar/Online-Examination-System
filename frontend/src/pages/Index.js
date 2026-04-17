// frontend/src/pages/Index.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>

      {/* HEADER */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '15px 40px',
        alignItems: 'center',
        background: '#fff',
        color: '#0f172a'
      }}>
        <h2>Online Examination</h2>

        <div>
          <Link to="/login" style={btnStyle}>Login</Link>
          <Link to="/register" style={{ ...btnStyle, marginLeft: 10 }}>Register</Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{
        textAlign: 'center',
        padding: '80px 20px',
        background: '#f1f5f9'
      }}>
        <h1 style={{ fontSize: 40, marginBottom: 20 }}>
          Welcome to Online Examination System
        </h1>
        <p style={{ fontSize: 18, color: '#555', maxWidth: 600, margin: 'auto' }}>
          Take exams online, track your performance, and improve your skills.
          Our platform provides a secure and easy way to conduct examinations.
        </p>

        <div style={{ marginTop: 30 }}>
          <Link to="/Register" style={primaryBtn}>Get Started</Link>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <h2>Features</h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 30,
          marginTop: 30,
          flexWrap: 'wrap'
        }}>
          <div style={card}>
            <h3>📝 Online Exams</h3>
            <p>Attempt exams anytime, anywhere.</p>
          </div>

          <div style={card}>
            <h3>📊 Instant Results</h3>
            <p>Get results immediately after submission.</p>
          </div>

          <div style={card}>
            <h3>🔐 Secure System</h3>
            <p>Safe and reliable exam environment.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: '#fff',
        color: '#0f172a',
        textAlign: 'center',
        padding: 15
      }}>
        © 2026 Made by Kundan (Cimage Group of Institutions)
      </footer>

    </div>
  );
}

// styles
const btnStyle = {
  color: '#0f172a',
  textDecoration: 'none',
  padding: '8px 15px',
  border: '1px solid #0f172a',
  borderRadius: 5
};

const primaryBtn = {
  background: '#2563eb',
  color: '#fff',
  padding: '12px 25px',
  textDecoration: 'none',
  borderRadius: 5
};

const card = {
  background: '#fff',
  padding: 20,
  borderRadius: 10,
  width: 250,
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
};