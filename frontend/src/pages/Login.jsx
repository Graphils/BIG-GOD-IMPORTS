import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const recaptchaRef = useRef();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) { toast.error('Please complete the CAPTCHA.'); return; }
    setLoading(true);
    try {
      await login(form.emailOrUsername, form.password, captchaToken);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
      recaptchaRef.current?.reset();
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-main">BIG-GOD</span>
            <span className="logo-sub">IMPORTS</span>
          </Link>
          <h1>Sign In</h1>
          <p>Welcome back. Please sign in to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email or Username</label>
            <input name="emailOrUsername" type="text" value={form.emailOrUsername} onChange={handleChange} placeholder="Enter email or username" required autoComplete="username" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrap">
              <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Enter your password" required autoComplete="current-password" />
              <button type="button" className="show-pass" onClick={() => setShowPass(s => !s)} tabIndex="-1">
                {showPass ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
          </div>
          <div style={{textAlign:'right',marginBottom:'20px',marginTop:'-12px'}}>
            <Link to="/forgot-password" className="auth-link" style={{fontSize:'13px'}}>Forgot password?</Link>
          </div>
          <div className="captcha-wrap">
            <ReCAPTCHA ref={recaptchaRef} sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'} onChange={token => setCaptchaToken(token || '')} onExpired={() => setCaptchaToken('')} />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',marginTop:'20px'}} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
      </div>
    </div>
  );
}
