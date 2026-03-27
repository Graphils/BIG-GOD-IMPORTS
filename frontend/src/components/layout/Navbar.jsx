import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { usePreOrderCart } from '../../context/PreOrderCartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { cartCount: preOrderCount } = usePreOrderCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const closeAll = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <>
      <div className="announcement-bar">
        <div className="announcement-track">
          <span>✦ Quality Imports Delivered Across Ghana</span>
          <span>✦ Secure Payments via Paystack</span>
          <span>✦ Shop Available &amp; Pre-Order Items</span>
          <span>✦ WhatsApp Us: 0204069997</span>
          <span>✦ Quality Imports Delivered Across Ghana</span>
          <span>✦ Secure Payments via Paystack</span>
          <span>✦ Shop Available &amp; Pre-Order Items</span>
          <span>✦ WhatsApp Us: 0204069997</span>
        </div>
      </div>

      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container navbar-inner">

          {/* LOGO */}
          <Link to="/" className="navbar-logo" onClick={closeAll}>
            <img src="/logo.jpg" alt="Big-God Imports" />
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="navbar-links desktop-only">
            <NavLink to="/" end>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </NavLink>
            <NavLink to="/shop">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Shop
            </NavLink>
            <NavLink to="/pre-order" className="preorder-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Pre-Order
            </NavLink>
            <NavLink to="/contact">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Contact
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="admin-link">Admin</NavLink>
            )}
          </nav>

          {/* ACTIONS — always visible */}
          <div className="navbar-actions">

            {/* Dark mode toggle — always visible */}
            <button className="icon-btn dark-toggle" onClick={() => setDark(d => !d)} aria-label="Toggle dark mode" title={dark ? 'Light mode' : 'Dark mode'}>
              {dark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            {/* Search — always visible */}
            <button className="icon-btn search-icon-btn" onClick={() => setSearchOpen(s => !s)} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>

            {/* User — desktop: full dropdown | mobile: "Sign In" text only, rest in hamburger */}
            {user ? (
              <>
                {/* Desktop user menu */}
                <div ref={userMenuRef} className="user-menu-wrap desktop-only">
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
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="admin-link-menu">Admin Panel</Link>
                      )}
                      <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }} className="logout-btn">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Sign In button — shows text on all sizes, no wrapping */
              <Link to="/login" className="signin-btn" aria-label="Sign in" onClick={closeAll}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Sign In</span>
              </Link>
            )}

            {/* Desktop-only cart icons */}
            <Link to="/cart" className="icon-btn cart-btn desktop-only" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>
            <Link to="/pre-order-cart" className="icon-btn cart-btn preorder-cart-btn desktop-only" aria-label="Pre-Order Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {preOrderCount > 0 && <span className="cart-badge preorder-badge">{preOrderCount > 99 ? '99+' : preOrderCount}</span>}
            </Link>

            {/* Hamburger — mobile only */}
            <button className={`hamburger mobile-only${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(s => !s)} aria-label="Menu">
              <span/><span/><span/>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
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

        {/* MOBILE SLIDE-DOWN MENU */}
        {menuOpen && (
          <div className="mobile-menu">
            <nav className="mobile-nav-links">
              <NavLink to="/" end onClick={closeAll}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Home
              </NavLink>
              <NavLink to="/shop" onClick={closeAll}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Shop
              </NavLink>
              <NavLink to="/pre-order" onClick={closeAll} className="preorder-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Pre-Order
              </NavLink>
              <NavLink to="/contact" onClick={closeAll}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Contact
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" onClick={closeAll} className="admin-link">
                  Admin
                </NavLink>
              )}
            </nav>

            <div className="mobile-menu-divider" />

            {/* Cart links in mobile menu */}
            <div className="mobile-cart-links">
              <Link to="/cart" onClick={closeAll} className="mobile-cart-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Cart
                {cartCount > 0 && <span className="mobile-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
              </Link>
              <Link to="/pre-order-cart" onClick={closeAll} className="mobile-cart-link preorder-cart-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Pre-Order Cart
                {preOrderCount > 0 && <span className="mobile-badge preorder-badge">{preOrderCount > 99 ? '99+' : preOrderCount}</span>}
              </Link>
            </div>

            {/* User account section in mobile menu */}
            {user && (
              <>
                <div className="mobile-menu-divider" />
                <div className="mobile-user-section">
                  <p className="mobile-user-name">{user.firstName || user.username}</p>
                  <p className="mobile-user-email">{user.email}</p>
                  <Link to="/profile" onClick={closeAll}>My Profile</Link>
                  <Link to="/orders" onClick={closeAll}>My Orders</Link>
                  <Link to="/wishlist" onClick={closeAll}>Wishlist</Link>
                  {isAdmin && <Link to="/admin" onClick={closeAll} className="admin-link-menu">Admin Panel</Link>}
                  <button onClick={() => { logout(); closeAll(); navigate('/'); }} className="logout-btn">
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}