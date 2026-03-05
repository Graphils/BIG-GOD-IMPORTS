import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState('');
  const [wishlisted, setWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.get(`/products/${id}`), api.get(`/reviews/${id}`)]).then(([p,r]) => {
      setProduct(p.data.product);
      setMainImg(p.data.product.images?.find(i=>i.isMain)?.url || p.data.product.images?.[0]?.url || '');
      setReviews(r.data.reviews || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please sign in.'); return; }
    try { await addToCart(product._id, qty); toast.success(`${qty} item${qty>1?'s':''} added to cart!`); } catch { toast.error('Failed.'); }
  };

  const toggleWishlist = async () => {
    if (!user) { toast.error('Please sign in.'); return; }
    try { const r = await api.post('/wishlist/toggle',{productId:product._id}); setWishlisted(r.data.action==='added'); toast.success(r.data.message); } catch {}
  };

  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  if (!product) return <div className="empty-state"><h3>Product not found.</h3><Link to="/shop" className="btn btn-primary">Back to Shop</Link></div>;

  return (
    <div>
      <div className="page-title"><div className="container"><div className="breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/shop">Shop</Link><span>/</span><span>{product.name}</span></div></div></div>
      <div className="container" style={{padding:'48px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'60px',alignItems:'start'}}>
          <div>
            <div style={{aspectRatio:'1',background:'var(--cream)',borderRadius:'var(--radius-md)',overflow:'hidden',marginBottom:'16px',border:'1px solid var(--border)'}}>
              {mainImg ? <img src={mainImg} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>}
            </div>
            {product.images?.length > 1 && (
              <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                {product.images.map((img,i) => <button key={i} onClick={() => setMainImg(img.url)} style={{width:'72px',height:'72px',borderRadius:'var(--radius)',overflow:'hidden',border:`2px solid ${mainImg===img.url?'var(--gold)':'var(--border)'}`,background:'none',cursor:'pointer',padding:0}}><img src={img.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/></button>)}
              </div>
            )}
          </div>
          <div>
            <span className="section-label">{product.category}</span>
            <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,3vw,44px)',color:'var(--navy)',margin:'8px 0 16px'}}>{product.name}</h1>
            {product.ratings?.count > 0 && (
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
                {[1,2,3,4,5].map(s=><span key={s} style={{color:s<=Math.round(product.ratings.average)?'var(--gold)':'#ddd',fontSize:'18px'}}>★</span>)}
                <span style={{fontSize:'14px',color:'var(--text-light)'}}>({product.ratings.count} review{product.ratings.count!==1?'s':''})</span>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:'32px',fontWeight:'700',color:'var(--navy)'}}>GHS {product.price.toLocaleString('en-GH',{minimumFractionDigits:2})}</span>
              {product.comparePrice && <span style={{fontSize:'20px',color:'var(--text-light)',textDecoration:'line-through'}}>GHS {product.comparePrice.toFixed(2)}</span>}
            </div>
            <p style={{color:'var(--text-mid)',lineHeight:'1.8',marginBottom:'24px'}}>{product.description}</p>
            <div style={{marginBottom:'24px'}}>
              <span className={`badge ${product.stockStatus==='in_stock'?'badge-success':product.stockStatus==='low_stock'?'badge-warning':'badge-error'}`}>
                {product.stockStatus==='in_stock'?'In Stock':product.stockStatus==='low_stock'?`Low Stock (${product.stock} left)`:'Out of Stock'}
              </span>
            </div>
            {product.stockStatus !== 'out_of_stock' && (
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
                <div className="cart-item-qty">
                  <button onClick={() => setQty(q=>Math.max(1,q-1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q=>Math.min(product.stock,q+1))}>+</button>
                </div>
                <span style={{fontSize:'13px',color:'var(--text-light)'}}>{product.stock} available</span>
              </div>
            )}
            <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
              <button className="btn btn-gold btn-lg" onClick={handleAddToCart} disabled={product.stockStatus==='out_of_stock'} style={{flex:1}}>
                {product.stockStatus==='out_of_stock'?'Out of Stock':'Add to Cart'}
              </button>
              <button className={`btn btn-outline${wishlisted?' btn-primary':''}`} onClick={toggleWishlist} style={{padding:'14px 18px'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted?'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
            <div style={{marginTop:'32px',padding:'20px',background:'var(--cream)',borderRadius:'var(--radius)',fontSize:'13px',color:'var(--text-light)',display:'flex',gap:'16px',flexWrap:'wrap'}}>
              <span><svg style={{verticalAlign:'middle'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Secure payment</span>
              <span><svg style={{verticalAlign:'middle'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Nationwide delivery</span>
              {product.sku && <span>SKU: {product.sku}</span>}
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div style={{marginTop:'64px'}}>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'32px',color:'var(--navy)',marginBottom:'28px'}}>Customer Reviews</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'20px'}}>
              {reviews.map(r => (
                <div key={r._id} style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'20px'}}>
                  <div style={{display:'flex',gap:'4px',marginBottom:'8px'}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=r.rating?'var(--gold)':'#ddd'}}>★</span>)}</div>
                  {r.title && <p style={{fontWeight:'700',color:'var(--navy)',marginBottom:'6px'}}>{r.title}</p>}
                  <p style={{fontSize:'14px',color:'var(--text-mid)',lineHeight:'1.7'}}>{r.comment}</p>
                  <p style={{fontSize:'12px',color:'var(--text-light)',marginTop:'12px'}}>— {r.user?.username} · {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
