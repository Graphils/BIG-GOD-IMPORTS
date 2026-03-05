import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLES = {
  pending: { background: '#fff3e0', color: '#d48200' },
  confirmed: { background: '#e3f2fd', color: '#1565c0' },
  processing: { background: '#f3e5f5', color: '#6a1b9a' },
  shipped: { background: '#e0f7fa', color: '#00838f' },
  delivered: { background: '#e8f5ee', color: '#1a7a4a' },
  cancelled: { background: '#fdecea', color: '#c0392b' },
};

function OrderDetailModal({ order, onClose, onUpdate }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    if (newStatus === order.status && !note) { toast.error('No changes to save.'); return; }
    setLoading(true);
    try {
      await api.put(`/admin/orders/${order._id}/status`, { status: newStatus, note });
      toast.success('Order status updated! Customer has been notified by email.');
      onUpdate();
    } catch { toast.error('Failed to update status.'); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflow: 'auto', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--navy)' }}>{order.orderNumber}</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '13px', marginTop: '4px' }}>
              Placed {new Date(order.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--cream)', padding: '16px', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Customer</p>
            <p style={{ fontWeight: '600', color: 'var(--navy)' }}>{order.user?.username || 'N/A'}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>{order.user?.email}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>{order.shippingAddress?.phone}</p>
          </div>
          <div style={{ background: 'var(--cream)', padding: '16px', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Shipping To</p>
            <p style={{ fontWeight: '600', color: 'var(--navy)' }}>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>{order.shippingAddress?.street}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>{order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Order Items</p>
          {order.items?.map(item => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />}
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--navy)' }}>{item.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>GHS {item.price?.toFixed(2)} × {item.quantity}</p>
                </div>
              </div>
              <p style={{ fontWeight: '700', color: 'var(--navy)' }}>GHS {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-mid)', fontSize: '14px' }}>
            <span>Shipping</span><span>GHS {order.shippingCost?.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', fontWeight: '700', fontSize: '18px', color: 'var(--navy)' }}>
            <span>Total</span><span>GHS {order.total?.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--cream)', borderRadius: 'var(--radius)', display: 'flex', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment</p>
            <p style={{ fontWeight: '600', color: 'var(--navy)', textTransform: 'capitalize' }}>{order.paymentMethod?.replace('_', ' ')}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment Status</p>
            <p style={{ fontWeight: '600', color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--error)', textTransform: 'uppercase' }}>{order.paymentStatus}</p>
          </div>
          {order.paystackReference && <div>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Reference</p>
            <p style={{ fontWeight: '500', color: 'var(--text-mid)', fontSize: '13px' }}>{order.paystackReference}</p>
          </div>}
        </div>

        {/* Status Update */}
        <div style={{ background: 'var(--cream)', padding: '20px', borderRadius: 'var(--radius)', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--navy)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Update Order Status</p>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '12px' }}>The customer will automatically receive an email notification when you update the status.</p>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>New Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ background: 'var(--white)' }}>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Internal Note (optional)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Dispatched via GhanaPost..." />
          </div>
          <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Updating...' : 'Update Status & Notify Customer'}
          </button>
        </div>

        {/* History */}
        {order.statusHistory?.length > 0 && (
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Status History</p>
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', fontSize: '13px', color: 'var(--text-mid)' }}>
                <span style={{ ...STATUS_STYLES[h.status], padding: '2px 8px', borderRadius: '2px', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>{h.status?.toUpperCase()}</span>
                <span>{h.note || 'Status updated'} · {new Date(h.timestamp).toLocaleString('en-GH')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/admin/orders', { params: { page, status: statusFilter, limit: 20 } })
      .then(r => { setOrders(r.data.orders); setPages(r.data.pages); setTotal(r.data.total); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--navy)', padding: '32px 0' }}>
        <div className="container">
          <span className="section-label">Administration</span>
          <h1 style={{ color: 'var(--white)', fontSize: 'clamp(22px,3vw,32px)', margin: '8px 0 4px' }}>Order Management</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{total} orders total</p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['', ...ORDER_STATUSES].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Orders'}
            </button>
          ))}
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {loading ? <div className="loading-page"><div className="spinner" /></div> : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px' }}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
              <p>No orders found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--navy)' }}>
                  {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--gold)', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--white)' : 'var(--cream)', cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '14px' }}>{order.orderNumber}</p>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: '14px', color: 'var(--navy)', fontWeight: '500' }}>{order.user?.username}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{order.user?.email}</p>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-mid)' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--navy)', fontSize: '14px' }}>GHS {order.total?.toFixed(2)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--error)', textTransform: 'uppercase' }}>{order.paymentStatus}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ ...STATUS_STYLES[order.status], padding: '4px 10px', borderRadius: '2px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-light)' }}>{new Date(order.createdAt).toLocaleDateString('en-GH')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={() => { setSelectedOrder(null); fetchOrders(); }}
        />
      )}
    </div>
  );
}
