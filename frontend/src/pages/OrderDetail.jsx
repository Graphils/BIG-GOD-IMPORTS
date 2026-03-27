import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const STATUS_STEPS = ['pending','confirmed','processing','shipped','delivered'];
const STATUS_COLORS = { pending:'badge-warning', confirmed:'badge-navy', processing:'badge-warning', shipped:'badge-navy', delivered:'badge-success', cancelled:'badge-error' };

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  if (!order) return <div className="empty-state"><h3>Order not found.</h3><Link to="/orders" className="btn btn-primary">Back to Orders</Link></div>;
  const stepIdx = STATUS_STEPS.indexOf(order.status);
  return (
    <div>
      <div className="page-title"><div className="container"><div className="breadcrumb"><Link to="/orders">My Orders</Link><span>/</span><span>{order.orderNumber}</span></div><h1>Order {order.orderNumber}</h1></div></div>
      <div className="container" style={{padding:'48px 24px',maxWidth:'900px'}}>
        {order.status !== 'cancelled' && (
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)',padding:'32px',marginBottom:'32px'}}>
            <h3 style={{marginBottom:'24px',color:'var(--text-heading)'}}>Order Progress</h3>
            <div style={{display:'flex',justifyContent:'space-between',position:'relative'}}>
              <div style={{position:'absolute',top:'16px',left:'0',right:'0',height:'2px',background:'var(--border)',zIndex:0}}/>
              <div style={{position:'absolute',top:'16px',left:'0',height:'2px',background:'var(--gold)',zIndex:1,width:`${Math.max(0,(stepIdx/(STATUS_STEPS.length-1))*100)}%`,transition:'width 0.5s'}}/>
              {STATUS_STEPS.map((s,i) => (
                <div key={s} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',zIndex:2}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'50%',background:i<=stepIdx?'var(--gold)':'var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'700',color:i<=stepIdx?'var(--navy)':'#999'}}>{i<=stepIdx?'✓':i+1}</div>
                  <span style={{fontSize:'11px',textTransform:'uppercase',letterSpacing:'1px',fontWeight:'600',color:i<=stepIdx?'var(--navy)':'var(--text-light)'}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',marginBottom:'24px'}}>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)',padding:'24px'}}>
            <h4 style={{marginBottom:'16px',color:'var(--text-heading)'}}>Order Details</h4>
            <p><strong>Status:</strong> <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status.toUpperCase()}</span></p>
            <p style={{marginTop:'8px'}}><strong>Payment:</strong> {order.paymentMethod?.replace('_',' ').toUpperCase()}</p>
            <p style={{marginTop:'8px'}}><strong>Payment Status:</strong> {order.paymentStatus?.toUpperCase()}</p>
            <p style={{marginTop:'8px'}}><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-GH',{day:'numeric',month:'long',year:'numeric'})}</p>
          </div>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)',padding:'24px'}}>
            <h4 style={{marginBottom:'16px',color:'var(--text-heading)'}}>Shipping Address</h4>
            <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            <p style={{color:'var(--text-light)'}}>{order.shippingAddress?.phone}</p>
            <p style={{color:'var(--text-light)'}}>{order.shippingAddress?.street}</p>
            <p style={{color:'var(--text-light)'}}>{order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
          </div>
        </div>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)',padding:'24px'}}>
          <h4 style={{marginBottom:'20px',color:'var(--text-heading)'}}>Items Ordered</h4>
          {order.items?.map(item => (
            <div key={item._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid var(--border-color)'}}>
              <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
                {item.image && <img src={item.image} alt={item.name} style={{width:'56px',height:'56px',objectFit:'cover',borderRadius:'4px'}}/>}
                <div><p style={{fontWeight:'600',color:'var(--text-heading)'}}>{item.name}</p><p style={{fontSize:'13px',color:'var(--text-light)'}}>Qty: {item.quantity}</p></div>
              </div>
              <span style={{fontWeight:'700',color:'var(--text-heading)'}}>GHS {(item.price*item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{marginTop:'16px',display:'flex',flexDirection:'column',gap:'8px',alignItems:'flex-end'}}>
            <p>Subtotal: <strong>GHS {order.subtotal?.toFixed(2)}</strong></p>
            <p>Shipping: <strong>GHS {order.shippingCost?.toFixed(2)}</strong></p>
            <p style={{fontSize:'20px',fontFamily:'var(--font-display)',color:'var(--gold)'}}>Total: <strong>GHS {order.total?.toFixed(2)}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}