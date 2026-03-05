import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName||'', lastName: user?.lastName||'', phone: user?.phone||'', address: { street: user?.address?.street||'', city: user?.address?.city||'', region: user?.address?.region||'' } });
  const [loading, setLoading] = useState(false);
  const handleChange = e => { const {name,value} = e.target; if (name.startsWith('address.')) { const k = name.split('.')[1]; setForm(f=>({...f,address:{...f.address,[k]:value}})); } else setForm(f=>({...f,[name]:value})); };
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { await updateProfile(form); toast.success('Profile updated!'); } catch { toast.error('Update failed.'); } finally { setLoading(false); } };
  return (
    <div>
      <div className="page-title"><div className="container"><h1>My Profile</h1></div></div>
      <div className="container" style={{padding:'48px 24px',maxWidth:'680px'}}>
        <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'40px'}}>
          <div style={{marginBottom:'32px',paddingBottom:'24px',borderBottom:'1px solid var(--border)'}}>
            <p style={{fontSize:'12px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'var(--text-light)',marginBottom:'6px'}}>Account</p>
            <p style={{fontFamily:'var(--font-display)',fontSize:'22px',color:'var(--navy)'}}>{user?.username}</p>
            <p style={{color:'var(--text-light)',fontSize:'14px'}}>{user?.email}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>First Name</label><input name="firstName" value={form.firstName} onChange={handleChange}/></div>
              <div className="form-group"><label>Last Name</label><input name="lastName" value={form.lastName} onChange={handleChange}/></div>
            </div>
            <div className="form-group"><label>Phone Number</label><input name="phone" type="tel" value={form.phone} onChange={handleChange}/></div>
            <h4 style={{marginBottom:'16px',marginTop:'8px',color:'var(--navy)',fontSize:'16px'}}>Delivery Address</h4>
            <div className="form-group"><label>Street Address</label><input name="address.street" value={form.address.street} onChange={handleChange}/></div>
            <div className="form-row">
              <div className="form-group"><label>City</label><input name="address.city" value={form.address.city} onChange={handleChange}/></div>
              <div className="form-group"><label>Region</label><input name="address.region" value={form.address.region} onChange={handleChange}/></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving...':'Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
