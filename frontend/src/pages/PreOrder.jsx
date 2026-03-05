import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';

export default function PreOrder() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products', { params: { limit: 50 } })
      .then(r => {
        const preOrders = (r.data.products || []).filter(p => p.isPreOrder);
        setProducts(preOrders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--navy)', padding: '48px 0 40px' }}>
        <div className="container">
          <span className="section-label" style={{ color: '#ce93d8' }}>Coming Soon</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,48px)', color: 'var(--white)', margin: '8px 0 12px' }}>
            Pre-Order
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', maxWidth: '560px' }}>
            Reserve your items before they arrive. Pay now and we'll ship directly to you once stock lands.
          </p>
        </div>
      </div>

      {/* Notice banner */}
      <div style={{ background: '#f3e5f5', borderBottom: '1px solid #ce93d8', padding: '14px 0' }}>
        <div className="container">
          <p style={{ fontSize: '14px', color: '#6a1b9a', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>📦</span>
            <span><strong>How pre-order works:</strong> Place your order and complete payment. Your item will be shipped to you as soon as it arrives in stock. You'll be notified by email every step of the way.</span>
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" style={{ margin: '0 auto 16px' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <h3>No pre-order items right now</h3>
            <p>Check back soon — new items are on the way.</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Available Products</Link>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '24px' }}>
              {products.length} item{products.length !== 1 ? 's' : ''} available for pre-order
            </p>
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}