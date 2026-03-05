import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/wishlist').then(r => setProducts(r.data.wishlist?.products || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const handleToggle = (id, action) => { if (action === 'removed') setProducts(p => p.filter(x => x._id !== id)); };
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  return (
    <div>
      <div className="page-title"><div className="container"><h1>My Wishlist</h1></div></div>
      <div className="container" style={{padding:'48px 24px'}}>
        {!products.length ? (
          <div className="empty-state"><h3>Your wishlist is empty</h3><p>Save products you love to find them later.</p><Link to="/shop" className="btn btn-primary">Browse Shop</Link></div>
        ) : (
          <div className="products-grid">{products.map(p => <ProductCard key={p._id} product={p} isWishlisted={true} onWishlistToggle={handleToggle}/>)}</div>
        )}
      </div>
    </div>
  );
}
