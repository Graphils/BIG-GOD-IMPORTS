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

  /* Dark Mode */
  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  /* Scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Prevent scroll when menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  /* Close dropdown */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Search */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <div className="announcement-bar">
        <div className="announcement-track">
          <span>✦ Quality Imports Delivered Across Ghana</span>
          <span>✦ Secure Payments via Paystack</span>
          <span>✦ Shop Available & Pre-Order Items</span>
          <span>✦ WhatsApp Us: 0204069997</span>
        </div>
      </div>

      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <img src="/logo.jpg" alt="Big-God Imports" />
          </Link>

          {/* Desktop Links */}
          <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
            <NavLink to="/pre-order" onClick={() => setMenuOpen(false)}>Pre-Order</NavLink>
            <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>

            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
                Admin
              </NavLink>
            )}

            {/* Mobile extra items */}
            <div className="mobile-extra">

              <button onClick={() => setSearchOpen(true)}>
                Search
              </button>

              <button onClick={() => setDark(d => !d)}>
                {dark ? 'Light Mode' : 'Dark Mode'}
              </button>

              <Link to="/pre-order-cart" onClick={() => setMenuOpen(false)}>
                Pre-Order Cart ({preOrderCount})
              </Link>

              {user && (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
                </>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="navbar-actions">

            {/* Search Desktop */}
            <button
              className="icon-btn search-btn"
              onClick={() => setSearchOpen(s => !s)}
            >
              🔍
            </button>

            {/* Dark */}
            <button
              className="icon-btn dark-btn"
              onClick={() => setDark(d => !d)}
            >
              {dark ? '☀️' : '🌙'}
            </button>

            {/* Sign In Mandatory */}
            {user ? (
              <div ref={userMenuRef} className="user-menu-wrap">
                <button
                  className="signin-btn"
                  onClick={() => setUserMenuOpen(s => !s)}
                >
                  {user.firstName || user.username}
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile">My Profile</Link>
                    <Link to="/orders">My Orders</Link>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="signin-btn">
                Sign In
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="icon-btn cart-btn">
              🛒
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(s => !s)}
            >
              <span />
              <span />
              <span />
            </button>

          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="search-bar">
            <form onSubmit={handleSearch} className="container">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}