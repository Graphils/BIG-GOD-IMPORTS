import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import '../../styles/admin.css';

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
  const [shippingCost, setShippingCost] = useState(order.shippingCost || 0);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/orders/${order._id}/status`, { status: newStatus, note, shippingCost: Number(shippingCost) });
      toast.success('Order updated!');
      onUpdate();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflow: 'auto', padding: 'clamp(20px, 5vw, 40px)', margin: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 26px)', color: 'var(--navy)' }}>{order.orderNumber}</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '13px', marginTop: '4px' }}>
              {new Date(order.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="admin-two-col" style={{ marginBottom: '20px' }}>
          <div style={{ background: 'var(--cream)', padding: '14px', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Customer</p>
            <p style={{ fontWeight: '600', color: 'var(--navy)' }}>{order.user?.username || 'N/A'}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>{order.user?.email}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>{order.shippingAddress?.phone}</p>
          </div>
          <div style={{ background: 'var(--cream)', padding: '14px', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Shipping To</p>
            <p style={{ fontWeight: '600', color: 'var(--navy)' }}>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>{order.shippingAddress?.street}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>{order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
          </div>
        </div>

        {/* Items */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Order Items</p>
          {order.items?.map(item => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius)', flexShrink: 0 }} />}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>GHS {item.price?.toFixed(2)} × {item.quantity}</p>
                </div>
              </div>
              <p style={{ fontWeight: '700', color: 'var(--navy)', flexShrink: 0 }}>GHS {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-mid)', fontSize: '14px' }}>
            <span>Shipping</span><span>GHS {order.shippingCost?.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: '700', fontSize: '18px', color: 'var(--navy)' }}>
            <span>Total</span><span>GHS {order.total?.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment info */}
        <div style={{ marginBottom: '20px', padding: '14px', background: 'var(--cream)', borderRadius: 'var(--radius)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment</p>
            <p style={{ fontWeight: '600', color: 'var(--navy)', textTransform: 'capitalize' }}>{order.paymentMethod?.replace('_', ' ')}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</p>
            <p style={{ fontWeight: '600', color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--error)', textTransform: 'uppercase' }}>{order.paymentStatus}</p>
          </div>
        </div>

        {/* Status Update */}
        <div style={{ background: 'var(--cream)', padding: '16px', borderRadius: 'var(--radius)', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--navy)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Update Order Status</p>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '12px' }}>Customer will be notified by email.</p>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label>New Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ background: 'var(--white)' }}>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label>Delivery Fee (GHS)</label>
            <input type="number" min="0" step="0.01" value={shippingCost} onChange={e => setShippingCost(e.target.value)} placeholder="e.g. 20.00" style={{ background: 'var(--white)' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '14px' }}>
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
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '13px', color: 'var(--text-mid)', flexWrap: 'wrap' }}>
                <span style={{ ...STATUS_STYLES[h.status], padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>{h.status?.toUpperCase()}</span>
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
    return api.get('/admin/orders', { params: { page, status: statusFilter, limit: 20 } })
      .then(r => { setOrders(r.data.orders); setPages(r.data.pages); setTotal(r.data.total); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <span className="section-label">Administration</span>
          <h1>Order Management</h1>
          <p>{total} orders total</p>
        </div>
      </div>

      <div className="container">
        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['', ...ORDER_STATUSES].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {loading ? <div className="loading-page"><div className="spinner" /></div> : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)', background: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p>No orders found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="admin-table-wrap order-table">
                <table>
                  <thead>
                    <tr style={{ background: 'var(--navy)' }}>
                      {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--gold)', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => (
                      <tr key={order._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--white)' : 'var(--cream)', cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--navy)', fontSize: '14px', whiteSpace: 'nowrap' }}>{order.orderNumber}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: '14px', color: 'var(--navy)', fontWeight: '500', whiteSpace: 'nowrap' }}>{order.user?.username}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{order.user?.email}</p>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--navy)', fontSize: '14px', whiteSpace: 'nowrap' }}>GHS {order.total?.toFixed(2)}</td>
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--error)', textTransform: 'uppercase' }}>{order.paymentStatus}</span>
                        </td>
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ ...STATUS_STYLES[order.status], padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{order.status}</span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>{new Date(order.createdAt).toLocaleDateString('en-GH')}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="order-cards">
              {orders.map(order => (
                <div key={order._id} className="order-card" onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                  <div className="order-card-header">
                    <p style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '15px' }}>{order.orderNumber}</p>
                    <span style={{ ...STATUS_STYLES[order.status], padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{order.status}</span>
                  </div>
                  <div className="order-card-row"><span>Customer</span><span style={{ fontWeight: '500' }}>{order.user?.username}</span></div>
                  <div className="order-card-row"><span>Items</span><span>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span></div>
                  <div className="order-card-row"><span>Total</span><span style={{ fontWeight: '700', color: 'var(--navy)' }}>GHS {order.total?.toFixed(2)}</span></div>
                  <div className="order-card-row"><span>Payment</span><span style={{ color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--error)', fontWeight: '600', textTransform: 'uppercase' }}>{order.paymentStatus}</span></div>
                  <div className="order-card-row" style={{ border: 'none' }}><span>Date</span><span>{new Date(order.createdAt).toLocaleDateString('en-GH')}</span></div>
                </div>
              ))}
            </div>
          </>
        )}

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