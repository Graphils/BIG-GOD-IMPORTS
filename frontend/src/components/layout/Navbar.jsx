import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); setSearchQuery(''); }
  };

  return (
    <>
      <div className="announcement-bar">Free delivery on orders above GHS 500 across Ghana</div>
      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="logo-main">BIG-GOD</span>
            <span className="logo-sub">IMPORTS</span>
          </Link>
          <nav className={`navbar-links${menuOpen ? ' open' : ''}`}>
            <NavLink to="/" onClick={() => setMenuOpen(false)} end>Home</NavLink>
            <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
            <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
            <NavLink to="/pre-order" onClick={() => setMenuOpen(false)} className="preorder-link">Pre-Order</NavLink>
            {isAdmin && <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="admin-link">Admin</NavLink>}
          </nav>
          <div className="navbar-actions">
            <button className="icon-btn" onClick={() => setSearchOpen(s => !s)} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            {user ? (
              <div ref={userMenuRef} className="user-menu-wrap">
                <button className="icon-btn" onClick={() => setUserMenuOpen(s => !s)} aria-label="Account">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <p className="user-dropdown-name">{user.firstName || user.username}</p>
                      <p className="user-dropdown-email">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}>My Profile</Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                    <Link to="/wishlist" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                    {isAdmin && <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="admin-link-menu">Admin Panel</Link>}
                    <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }} className="logout-btn">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="icon-btn" aria-label="Sign in">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            )}
            <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>
            <button className={`hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(s => !s)} aria-label="Menu">
              <span/><span/><span/>
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="search-bar">
            <form onSubmit={handleSearch} className="container">
              <input autoFocus type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button type="submit" className="btn btn-gold btn-sm">Search</button>
              <button type="button" onClick={() => setSearchOpen(false)} className="search-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}