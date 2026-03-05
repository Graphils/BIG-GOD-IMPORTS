import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/products/featured'), api.get('/products/categories')])
      .then(([feat, cats]) => {
        setFeatured(feat.data.products || []);
        setCategories(cats.data.categories || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <span className="section-label">Ghana's Premium Import Store</span>
            <h1 className="hero-title">Quality Goods<br/><span className="hero-title-accent">Imported For You</span></h1>
            <p className="hero-desc">Discover a curated selection of premium imported products — from electronics to household goods, fashion, and more. Trusted by thousands across Ghana.</p>
            <form className="hero-search" onSubmit={handleSearch}>
              <input type="text" placeholder="What are you looking for?" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button type="submit" className="btn btn-gold">Search</button>
            </form>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary btn-lg">Shop Now</Link>
              <Link to="/contact" className="btn btn-outline btn-lg">Contact Us</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-float hero-card-1">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div><strong>Secured</strong><span>SSL Encrypted</span></div>
            </div>
            <div className="hero-card-float hero-card-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              <div><strong>Fast Delivery</strong><span>Across Ghana</span></div>
            </div>
            <div className="hero-card-float hero-card-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <div><strong>Quality</strong><span>Premium Imports</span></div>
            </div>
            <div className="hero-image-placeholder">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust-bar">
        <div className="container trust-items">
          {[
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Secure Payments', desc: 'Powered by Paystack' },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: 'Nationwide Delivery', desc: 'Across all regions' },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: 'Quality Guaranteed', desc: 'Certified products' },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12"/><path d="M9 3H5a2 2 0 0 0-2 2v4m3.69 9.31l1.06 1.06L12 21.23"/></svg>, title: '24/7 Support', desc: 'Always here to help' },
          ].map((item, i) => (
            <div className="trust-item" key={i}>
              <div className="trust-icon">{item.icon}</div>
              <div><strong>{item.title}</strong><span>{item.desc}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="section categories-section">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Browse by Category</span>
              <h2>Shop by Category</h2>
            </div>
            <div className="categories-grid">
              {categories.slice(0,8).map(cat => (
                <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} className="category-card">
                  <div className="category-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  </div>
                  <span>{cat}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Hand-picked for You</span>
            <h2>Featured Products</h2>
            <p>Discover our most popular imported goods, carefully selected for quality and value.</p>
          </div>
          {loading ? <div className="spinner"/> : featured.length > 0 ? (
            <>
              <div className="products-grid">
                {featured.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              <div style={{textAlign:'center',marginTop:'48px'}}>
                <Link to="/shop" className="btn btn-primary btn-lg">View All Products</Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>Coming Soon</h3>
              <p>Products are being added. Check back shortly.</p>
              <Link to="/shop" className="btn btn-primary">Browse Shop</Link>
            </div>
          )}
        </div>
      </section>

      {/* PAYMENT METHODS */}
      <section className="payment-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Multiple Payment Options</span>
            <h2>Pay Your Way</h2>
          </div>
          <div className="payment-methods">
            <div className="payment-method">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <h4>Credit / Debit Card</h4>
              <p>Visa, Mastercard accepted</p>
            </div>
            <div className="payment-method">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l1.44-1.44a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <h4>Mobile Money</h4>
              <p>MTN, Vodafone, AirtelTigo</p>
            </div>
            <div className="payment-method">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <h4>Bank Transfer</h4>
              <p>Access Bank Ghana</p>
            </div>
          </div>
          <p style={{textAlign:'center',marginTop:'24px',color:'var(--text-light)',fontSize:'14px'}}>All transactions are secured and encrypted by Paystack.</p>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <h2>Have a Question?</h2>
            <p>Our team is ready to assist you. Reach out via WhatsApp, phone, or email.</p>
          </div>
          <div className="cta-buttons">
            <a href="https://wa.me/233592384780" target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-lg">WhatsApp Us</a>
            <Link to="/contact" className="btn btn-outline btn-lg" style={{color:'var(--white)',borderColor:'var(--white)'}}>Send a Message</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
