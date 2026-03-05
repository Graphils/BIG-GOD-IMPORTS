import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { usePreOrderCart } from '../../context/PreOrderCartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './ProductCard.css';

export default function ProductCard({ product, onWishlistToggle, isWishlisted }) {
  const { addToCart } = useCart();
  const { addToCart: addToPreOrderCart } = usePreOrderCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(isWishlisted || false);

  const isUnavailable = product.stockStatus === 'out_of_stock' && !product.isPreOrder;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to add items to cart.'); return; }
    if (isUnavailable) return;
    setAdding(true);
    try {
      if (product.isPreOrder) {
        await addToPreOrderCart(product._id, 1);
        toast.success('Added to pre-order cart!');
      } else {
        await addToCart(product._id, 1);
        toast.success('Added to cart!');
      }
    } catch (err) {
      toast.error('Failed to add to cart.');
    } finally { setAdding(false); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to save items.'); return; }
    try {
      const res = await api.post('/wishlist/toggle', { productId: product._id });
      setWishlisted(res.data.action === 'added');
      toast.success(res.data.message);
      if (onWishlistToggle) onWishlistToggle(product._id, res.data.action);
    } catch { toast.error('Error updating wishlist.'); }
  };

  const mainImage = product.images?.find(i => i.isMain)?.url || product.images?.[0]?.url;
  const discount = product.comparePrice ? Math.round((1 - product.price/product.comparePrice)*100) : null;

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-image-wrap">
        {mainImage
          ? <img src={mainImage} alt={product.name} loading="lazy" />
          : <div className="product-image-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
        }
        <div className="product-badges">
          {product.isPreOrder && <span className="badge badge-preorder">Pre-Order</span>}
          {discount && !product.isPreOrder && <span className="badge badge-error">-{discount}%</span>}
          {product.stockStatus === 'out_of_stock' && !product.isPreOrder && <span className="badge badge-navy">Sold Out</span>}
          {product.stockStatus === 'low_stock' && !product.isPreOrder && <span className="badge badge-warning">Low Stock</span>}
          {product.isFeatured && <span className="badge badge-gold">Featured</span>}
        </div>
        <button className={`wishlist-btn${wishlisted ? ' active' : ''}`} onClick={handleWishlist} aria-label="Add to wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div className="product-overlay">
          <button
            className={`btn btn-gold btn-sm add-to-cart-btn${adding ? ' loading' : ''}`}
            onClick={handleAddToCart}
            disabled={adding || isUnavailable}
          >
            {adding ? 'Adding...' : isUnavailable ? 'Out of Stock' : product.isPreOrder ? 'Pre-Order Now' : 'Add to Cart'}
          </button>
        </div>
      </div>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        {product.ratings?.count > 0 && (
          <div className="product-rating">
            {[1,2,3,4,5].map(s => <span key={s} className={`star${s <= Math.round(product.ratings.average) ? ' filled' : ' empty'}`}>★</span>)}
            <span className="rating-count">({product.ratings.count})</span>
          </div>
        )}
        <div className="product-price">
          <span className="price-current">GHS {product.price.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span>
          {product.comparePrice && <span className="price-compare">GHS {product.comparePrice.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span>}
        </div>
        {product.isPreOrder && product.expectedDate && (
          <p style={{ fontSize: '11px', color: '#7b5ea7', fontWeight: '600', marginTop: '4px' }}>
            📦 Expected: {product.expectedDate}
          </p>
        )}
      </div>
    </Link>
  );
}