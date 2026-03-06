import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/admin.css';

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
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <span className="section-label">Administration</span>
          <h1>Customer Management</h1>
          <p>{users.length} registered customers</p>
        </div>
      </div>

      <div className="container">
        <div className="admin-toolbar">
          <input
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '10px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', background: 'var(--white)' }}
          />
        </div>

        {loading ? <div className="loading-page"><div className="spinner" /></div> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)', background: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p>No customers found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="admin-table-wrap order-table">
                <table>
                  <thead>
                    <tr style={{ background: 'var(--navy)' }}>
                      {['Customer', 'Username', 'Phone', 'Location', 'Joined', 'Status'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--gold)', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, i) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--white)' : 'var(--cream)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontWeight: '600', color: 'var(--navy)', fontSize: '14px', whiteSpace: 'nowrap' }}>{user.firstName || ''} {user.lastName || ''}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{user.email}</p>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>@{user.username}</td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>{user.phone || '—'}</td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>{user.address?.city ? `${user.address.city}, ${user.address.region}` : '—'}</td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>{new Date(user.createdAt).toLocaleDateString('en-GH')}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: user.isActive ? '#e8f5ee' : '#fdecea', color: user.isActive ? '#1a7a4a' : '#c0392b', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="order-cards">
              {filtered.map(user => (
                <div key={user._id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <p style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '15px' }}>{user.firstName || ''} {user.lastName || ''}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>@{user.username}</p>
                    </div>
                    <span style={{ background: user.isActive ? '#e8f5ee' : '#fdecea', color: user.isActive ? '#1a7a4a' : '#c0392b', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', flexShrink: 0 }}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <div className="order-card-row"><span>Email</span><span>{user.email}</span></div>
                  <div className="order-card-row"><span>Phone</span><span>{user.phone || '—'}</span></div>
                  <div className="order-card-row"><span>Location</span><span>{user.address?.city ? `${user.address.city}, ${user.address.region}` : '—'}</span></div>
                  <div className="order-card-row"><span>Joined</span><span>{new Date(user.createdAt).toLocaleDateString('en-GH')}</span></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}