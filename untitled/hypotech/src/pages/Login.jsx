// src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.phone, form.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-void)',
        position: 'relative',
      }}
    >
      <div className="stars-bg" />
      <div
        className="card"
        style={{ width: 420, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              fontSize: '3rem',
              marginBottom: 8,
              filter: 'drop-shadow(0 0 16px rgba(200,216,255,0.5))',
            }}
          >
            🌛
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 800,
            }}
          >
            HypoTech
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginTop: 4,
            }}
          >
            Smart Sleep Guardian
          </div>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 'var(--radius-sm)',
            padding: 4,
            marginBottom: 24,
          }}
        >
          {['login', 'register'].map((m) => (
            <div
              key={m}
              onClick={() => {
                setMode(m);
                setError('');
              }}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '9px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                background:
                  mode === m
                    ? 'linear-gradient(135deg,var(--aurora-1),var(--aurora-2))'
                    : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-muted)',
              }}
            >
              {m === 'login' ? '🔓 Login' : '✨ Register'}
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <>
              <div>
                <div className="form-label">Full Name</div>
                <input
                  className="form-input"
                  name="name"
                  placeholder="Arjun Kumar"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <div className="form-label">Phone (optional)</div>
                <input
                  className="form-input"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
          <div>
            <div className="form-label">Email Address</div>
            <input
              className="form-input"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <div className="form-label">Password</div>
            <input
              className="form-input"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: 'var(--danger)',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? '⏳ Please wait...'
              : mode === 'login'
                ? '🌙 Login'
                : '🚀 Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
