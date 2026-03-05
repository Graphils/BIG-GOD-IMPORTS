import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const StatCard = ({ title, value, subtitle, icon }) => (
  <div style={{
    background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    padding: '28px', display: 'flex', alignItems: 'flex-start', gap: '20px',
    boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)'
  }}>
    <div style={{
      width: '56px', height: '56px', background: 'var(--navy)', borderRadius: 'var(--radius-md)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{title}</p>
      <p style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--navy)', lineHeight: 1 }}>{value}</p>
      {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>{subtitle}</p>}
    </div>
  </div>
);

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
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--navy)', padding: '32px 0' }}>
        <div className="container">
          <span className="section-label">Administration</span>
          <h1 style={{ color: 'var(--white)', fontSize: 'clamp(24px,3vw,36px)', margin: '8px 0 4px' }}>Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>BIG-GOD IMPORTS — Management Panel</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <StatCard
            title="Total Revenue"
            value={`GHS ${(stats?.totalRevenue || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`}
            subtitle="All time paid orders"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            subtitle="All time orders"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
          />
          <StatCard
            title="Products"
            value={stats?.totalProducts || 0}
            subtitle="Active listings"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
          />
          <StatCard
            title="Customers"
            value={stats?.totalUsers || 0}
            subtitle="Registered users"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Recent Orders */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--navy)' }}>Recent Orders</h3>
              <Link to="/admin/orders" style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>View All</Link>
            </div>
            {stats?.recentOrders?.length > 0 ? stats.recentOrders.map(order => (
              <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)' }}>{order.orderNumber}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{order.user?.username} · {new Date(order.createdAt).toLocaleDateString('en-GH')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: '2px', fontSize: '11px',
                    fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase',
                    background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status]
                  }}>{order.status}</span>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy)', marginTop: '4px' }}>GHS {order.total?.toFixed(2)}</p>
                </div>
              </div>
            )) : <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>No orders yet.</p>}
          </div>

          {/* Low Stock */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--navy)' }}>Low / Out of Stock</h3>
              <Link to="/admin/products" style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Manage</Link>
            </div>
            {stats?.lowStockProducts?.length > 0 ? stats.lowStockProducts.map(p => (
              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--navy)' }}>{p.name}</p>
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
        <div style={{ marginTop: '24px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--navy)', marginBottom: '20px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/admin/products" className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Product
            </Link>
            <Link to="/admin/orders" className="btn btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
              Manage Orders
            </Link>
            <Link to="/admin/users" className="btn btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              View Customers
            </Link>
            <Link to="/admin/delivery-fees" className="btn btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h22v6H1z"/><path d="M1 9l11 7 11-7"/></svg>
              Delivery Fees
            </Link>
            <Link to="/shop" className="btn btn-gold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}