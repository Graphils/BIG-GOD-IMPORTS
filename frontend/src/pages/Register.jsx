import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'', confirmPassword:'', firstName:'', lastName:'', phone:'' });
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
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
            <div className="form-group"><label>Password *</label><input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters" required /></div>
            <div className="form-group"><label>Confirm Password *</label><input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required /></div>
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
