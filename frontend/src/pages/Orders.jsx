import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const STATUS_COLORS = { pending:'badge-warning', confirmed:'badge-navy', processing:'badge-warning', shipped:'badge-navy', delivered:'badge-success', cancelled:'badge-error' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchOrders = () => {
    api.get('/orders/my-orders').then(r => setOrders(r.data.orders || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleClearDelivered = async () => {
    if (!window.confirm('Remove all delivered orders from your history?')) return;
    setClearing(true);
    try {
      await api.delete('/orders/clear-delivered');
      fetchOrders();
    } catch { } finally { setClearing(false); }
  };
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  return (
    <div>
      <div className="page-title">
        <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
          <h1>My Orders</h1>
          {orders.some(o => o.status === 'delivered') && (
            <button onClick={handleClearDelivered} disabled={clearing} className="btn btn-outline btn-sm">
              {clearing ? 'Clearing...' : 'Clear Delivered'}
            </button>
          )}
        </div>
      </div>
      <div className="container" style={{padding:'48px 24px'}}>
        {!orders.length ? (
          <div className="empty-state"><h3>No orders yet</h3><p>You haven't placed any orders.</p><Link to="/shop" className="btn btn-primary">Start Shopping</Link></div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <Link to={`/orders/${order._id}`} key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <p className="order-number">{order.orderNumber}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-GH',{day:'numeric',month:'long',year:'numeric'})}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span className={`badge ${STATUS_COLORS[order.status] || 'badge-navy'}`}>{order.status.toUpperCase()}</span>
                    <p className="order-total">GHS {order.total?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="order-items-preview">
                  {order.items?.slice(0,3).map(item => <span key={item._id} className="order-item-thumb">{item.name} ×{item.quantity}</span>)}
                  {order.items?.length > 3 && <span className="order-item-thumb">+{order.items.length - 3} more</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <style>{`.orders-list{display:flex;flex-direction:column;gap:16px;}.order-card{display:block;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:24px;transition:var(--transition);}.order-card:hover{border-color:var(--gold);box-shadow:var(--shadow-md);}.order-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;}.order-number{font-family:var(--font-display);font-size:20px;color:var(--navy);font-weight:700;}.order-date{font-size:13px;color:var(--text-light);margin-top:4px;}.order-total{font-size:18px;font-weight:700;color:var(--gold);margin-top:8px;}.order-items-preview{display:flex;gap:8px;flex-wrap:wrap;}.order-item-thumb{font-size:12px;background:var(--bg-page);color:var(--text-mid);padding:4px 10px;border-radius:2px;}`}</style>
    </div>
  );
}