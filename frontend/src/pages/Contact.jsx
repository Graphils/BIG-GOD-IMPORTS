import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [loading, setLoading] = useState(false);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/contact', form);
      toast.success(res.data.message);
      setForm({ name:'', email:'', phone:'', subject:'', message:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-title"><div className="container"><h1>Contact Us</h1><p style={{color:'rgba(255,255,255,0.6)',marginTop:'8px'}}>We're here to help. Reach out any time.</p></div></div>
      <div className="container contact-layout">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          <p>Have questions about an order, a product, or just want to say hello? We respond within 24 hours.</p>
          <div className="contact-methods">
            <a href="tel:0592384780" className="contact-method">
              <div className="contact-method-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l1.44-1.44a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <div><strong>Call Us</strong><span>0592384780</span></div>
            </a>
            <a href="https://wa.me/233204069997" target="_blank" rel="noopener noreferrer" className="contact-method whatsapp">
              <div className="contact-method-icon" style={{background:'#25D366'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg></div>
              <div><strong>WhatsApp</strong><span>0204069997</span></div>
            </a>
            <a href="mailto:biggodimports@gmail.com" className="contact-method">
              <div className="contact-method-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
              <div><strong>Email</strong><span>biggodimports@gmail.com</span></div>
            </a>
          </div>
        </div>
        <div className="contact-form-wrap">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Your Name *</label><input name="name" value={form.name} onChange={handleChange} required /></div>
              <div className="form-group"><label>Email Address *</label><input name="email" type="email" value={form.email} onChange={handleChange} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Phone Number</label><input name="phone" type="tel" value={form.phone} onChange={handleChange} /></div>
              <div className="form-group"><label>Subject *</label><input name="subject" value={form.subject} onChange={handleChange} required /></div>
            </div>
            <div className="form-group"><label>Message *</label><textarea name="message" value={form.message} onChange={handleChange} rows={5} required placeholder="Write your message here..." /></div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{width:'100%'}}>{loading ? 'Sending...' : 'Send Message'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}