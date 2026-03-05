import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const EyeIcon = ({ open }) => open
  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'', confirmPassword:'', firstName:'', lastName:'', phone:'' });
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const recaptchaRef = useRef();
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    if (!captchaToken) { toast.error('Please complete the CAPTCHA.'); return; }
    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName, phone: form.phone, captchaToken });
      toast.success('Account created! Welcome to BIG-GOD IMPORTS!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
      recaptchaRef.current?.reset(); setCaptchaToken('');
    } finally { setLoading(false); }
  };

  const pwdFieldStyle = { position: 'relative' };
  const eyeBtnStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '4px', display: 'flex', alignItems: 'center' };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <Link to="/" className="auth-logo"><span className="logo-main">BIG-GOD</span><span className="logo-sub">IMPORTS</span></Link>
          <h1>Create Account</h1>
          <p>Join thousands of happy customers across Ghana.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group"><label>First Name</label><input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" /></div>
            <div className="form-group"><label>Last Name</label><input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" /></div>
          </div>
          <div className="form-group"><label>Username *</label><input name="username" value={form.username} onChange={handleChange} placeholder="Choose a unique username" required /></div>
          <div className="form-group"><label>Email Address *</label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required /></div>
          <div className="form-group"><label>Phone Number</label><input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="e.g. 0240000000" /></div>
          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <div style={pwdFieldStyle}>
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min 8 characters" required style={{ paddingRight: '40px' }} />
                <button type="button" style={eyeBtnStyle} onClick={() => setShowPassword(s => !s)}><EyeIcon open={showPassword} /></button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <div style={pwdFieldStyle}>
                <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required style={{ paddingRight: '40px' }} />
                <button type="button" style={eyeBtnStyle} onClick={() => setShowConfirm(s => !s)}><EyeIcon open={showConfirm} /></button>
              </div>
            </div>
          </div>
          <div className="captcha-wrap">
            <ReCAPTCHA ref={recaptchaRef} sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'} onChange={t => setCaptchaToken(t||'')} onExpired={() => setCaptchaToken('')} />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',marginTop:'20px'}} disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
      </div>
    </div>
  );
}