import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.users || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--navy)', padding: '32px 0' }}>
        <div className="container">
          <span className="section-label">Administration</span>
          <h1 style={{ color: 'var(--white)', fontSize: 'clamp(22px,3vw,32px)', margin: '8px 0 4px' }}>Customer Management</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{users.length} registered customers</p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <input
          placeholder="Search by name, username, or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '10px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', background: 'var(--white)', marginBottom: '24px', display: 'block' }}
        />

        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {loading ? <div className="loading-page"><div className="spinner" /></div> : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <p>No customers found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--navy)' }}>
                  {['Customer', 'Username', 'Phone', 'Location', 'Joined', 'Status'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--gold)', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--white)' : 'var(--cream)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontWeight: '600', color: 'var(--navy)', fontSize: '14px' }}>{user.firstName || ''} {user.lastName || ''}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{user.email}</p>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-mid)' }}>@{user.username}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-mid)' }}>{user.phone || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-mid)' }}>{user.address?.city ? `${user.address.city}, ${user.address.region}` : '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-light)' }}>{new Date(user.createdAt).toLocaleDateString('en-GH')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: user.isActive ? '#e8f5ee' : '#fdecea', color: user.isActive ? '#1a7a4a' : '#c0392b', padding: '4px 10px', borderRadius: '2px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
