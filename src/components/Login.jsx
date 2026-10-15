import React, { useState } from 'react';
import { Check } from 'lucide-react';
import TradePulseLogo from './TradePulseLogo';

const DEMO_USER = {
  name: 'Abhinay Singh',
  email: 'demo@tradepulse.com',
  password: 'demo123',
  clientId: 'TradePulse User'
};

export default function Login({ onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' or 'signup'
  const [loginEmail, setLoginEmail] = useState('demo@tradepulse.com');
  const [loginPassword, setLoginPassword] = useState('demo123');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const stored = localStorage.getItem('tradepulse_users');
    let users = stored ? JSON.parse(stored) : [];
    // Safely migrate any legacy demo user records
    users = users.map(u => {
      if (u.email === DEMO_USER.email || u.name === 'Ankit Sharma') {
        return { ...u, name: 'Abhinay Singh', clientId: 'TradePulse User' };
      }
      return u;
    });
    if (!users.some(u => u.email === DEMO_USER.email)) {
      users.unshift({ ...DEMO_USER });
    }
    localStorage.setItem('tradepulse_users', JSON.stringify(users));

    const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (!user || user.password !== loginPassword) {
      setError('Invalid email or password');
      return;
    }

    const session = {
      name: user.name || 'Abhinay Singh',
      email: user.email,
      clientId: user.clientId || 'TradePulse User'
    };
    localStorage.setItem('tradepulse_session', JSON.stringify(session));
    onLoginSuccess(session);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');

    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match');
      return;
    }

    const stored = localStorage.getItem('tradepulse_users');
    const users = stored ? JSON.parse(stored) : [{ ...DEMO_USER }];

    if (users.some(u => u.email.toLowerCase() === signupEmail.toLowerCase())) {
      setError('An account with this email already exists');
      return;
    }

    const newUser = {
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      clientId: 'TP' + Math.floor(1000 + Math.random() * 9000)
    };
    users.push(newUser);
    localStorage.setItem('tradepulse_users', JSON.stringify(users));

    const session = {
      name: newUser.name,
      email: newUser.email,
      clientId: newUser.clientId
    };
    localStorage.setItem('tradepulse_session', JSON.stringify(session));
    onLoginSuccess(session);
  };

  return (
    <div className="auth-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-brand">
            <TradePulseLogo size="lg" />
            <p style={{ marginTop: '16px' }}>Your gateway to smart investing. Real-time API stock dashboard, Chart.js visual analytics, and virtual portfolio management.</p>
          </div>
          <ul className="auth-features">
            <li><Check size={16} color="var(--primary)" style={{ flexShrink: 0 }} /> Real-time Stock Data (Finnhub API)</li>
            <li><Check size={16} color="var(--primary)" style={{ flexShrink: 0 }} /> Interactive Chart.js Price History</li>
            <li><Check size={16} color="var(--primary)" style={{ flexShrink: 0 }} /> Virtual Trading Portfolio & P&L</li>
            <li><Check size={16} color="var(--primary)" style={{ flexShrink: 0 }} /> Personalized Watchlist</li>
            <li><Check size={16} color="var(--primary)" style={{ flexShrink: 0 }} /> Customizable In-App Price Alerts</li>
          </ul>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => { setTab('login'); setError(''); }}
              >
                Login
              </button>
              <button
                className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
                onClick={() => { setTab('signup'); setError(''); }}
              >
                Sign Up
              </button>
            </div>

            {tab === 'login' ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <h2>Welcome back</h2>
                <p className="auth-subtitle">Sign in to access your TradePulse dashboard</p>

                {error && <p className="auth-error">{error}</p>}

                <div className="form-group">
                  <label htmlFor="loginEmail">Email</label>
                  <input
                    type="email"
                    id="loginEmail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="loginPassword">Password</label>
                  <input
                    type="password"
                    id="loginPassword"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary btn-full">
                  Login to Dashboard
                </button>

                <div className="demo-hint" style={{ marginTop: '20px' }}>
                  <p><strong>Demo College Credentials:</strong></p>
                  <p>Email: <code>demo@tradepulse.com</code></p>
                  <p>Password: <code>demo123</code></p>
                </div>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleSignup}>
                <h2>Create account</h2>
                <p className="auth-subtitle">Start your investing journey today</p>

                {error && <p className="auth-error">{error}</p>}

                <div className="form-group">
                  <label htmlFor="signupName">Full Name</label>
                  <input
                    type="text"
                    id="signupName"
                    placeholder="Your name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signupEmail">Email</label>
                  <input
                    type="email"
                    id="signupEmail"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signupPassword">Password</label>
                  <input
                    type="password"
                    id="signupPassword"
                    placeholder="Min 6 characters"
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signupConfirm">Confirm Password</label>
                  <input
                    type="password"
                    id="signupConfirm"
                    placeholder="Confirm password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary btn-full">
                  Create Account
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
