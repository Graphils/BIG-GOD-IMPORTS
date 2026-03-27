import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/admin.css';

const STATUS_COLORS = {
  pending: '#FF9800', confirmed: '#2196F3', processing: '#9C27B0',
  shipped: '#00BCD4', delivered: '#4CAF50', cancelled: '#F44336'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.stats)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <span className="section-label">Administration</span>
          <h1>Dashboard</h1>
          <p>BIG-GOD IMPORTS — Management Panel</p>
        </div>
      </div>

      <div className="container">
        {/* Stats Grid */}
        <div className="admin-stats-grid">
          {[
            { title: 'Total Revenue', value: `GHS ${(stats?.totalRevenue || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`, sub: 'All time paid orders', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
            { title: 'Total Orders', value: stats?.totalOrders || 0, sub: 'All time orders', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
            { title: 'Products', value: stats?.totalProducts || 0, sub: 'Active listings', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
            { title: 'Customers', value: stats?.totalUsers || 0, sub: 'Registered users', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          ].map(({ title, value, sub, icon }) => (
            <div key={title} className="stat-card">
              <div className="stat-card-icon">{icon}</div>
              <div>
                <p className="stat-card-label">{title}</p>
                <p className="stat-card-value">{value}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders + Low Stock */}
        <div className="admin-two-col" style={{ marginBottom: '24px' }}>
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-heading)' }}>Recent Orders</h3>
              <Link to="/admin/orders" style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>View All</Link>
            </div>
            {stats?.recentOrders?.length > 0 ? stats.recentOrders.map(order => (
              <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)' }}>{order.orderNumber}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{order.user?.username} · {new Date(order.createdAt).toLocaleDateString('en-GH')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status] }}>{order.status}</span>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-heading)', marginTop: '4px' }}>GHS {order.total?.toFixed(2)}</p>
                </div>
              </div>
            )) : <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>No orders yet.</p>}
          </div>

          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-heading)' }}>Low / Out of Stock</h3>
              <Link to="/admin/products" style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Manage</Link>
            </div>
            {stats?.lowStockProducts?.length > 0 ? stats.lowStockProducts.map(p => (
              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-heading)' }}>{p.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{p.category}</p>
                </div>
                <span className={`badge ${p.stockStatus === 'out_of_stock' ? 'badge-error' : 'badge-warning'}`}>
                  {p.stockStatus === 'out_of_stock' ? 'Out of Stock' : `${p.stock} left`}
                </span>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-light)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 12px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p>All products are well stocked.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-heading)', marginBottom: '16px' }}>Quick Actions</h3>
          <div className="admin-quick-actions">
            {[
              { to: '/admin/products', label: 'Add Product', cls: 'btn btn-primary' },
              { to: '/admin/orders', label: 'Manage Orders', cls: 'btn btn-outline' },
              { to: '/admin/users', label: 'View Customers', cls: 'btn btn-outline' },
              { to: '/admin/delivery-fees', label: 'Delivery Fees', cls: 'btn btn-outline' },
            ].map(({ to, label, cls }) => (
              <Link key={to} to={to} className={cls} style={{ textAlign: 'center', justifyContent: 'center' }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}