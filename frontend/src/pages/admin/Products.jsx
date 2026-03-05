import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import '../../styles/admin.css';

const GHANA_CATEGORIES = ['Electronics','Fashion & Clothing','Home & Kitchen','Health & Beauty','Sports & Fitness','Food & Beverages','Automobiles','Baby & Kids','Office Supplies','Tools & Hardware','Agriculture','Books & Stationery','Jewelry & Accessories','Toys & Games','Pet Supplies','Other'];

const emptyForm = {
  name: '', description: '', shortDescription: '', price: '', comparePrice: '',
  category: '', brand: '', stock: '', lowStockThreshold: '5', tags: '',
  isFeatured: false, weight: '',
  isPreOrder: false, preOrderNote: '', expectedDate: ''
};

const stockStatusStyle = (status) => ({
  in_stock: { background: '#e8f5ee', color: '#1a7a4a' },
  low_stock: { background: '#fff3e0', color: '#d48200' },
  out_of_stock: { background: '#fdecea', color: '#c0392b' }
}[status] || {});

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product ? {
    name: product.name || '', description: product.description || '',
    shortDescription: product.shortDescription || '', price: product.price || '',
    comparePrice: product.comparePrice || '', category: product.category || '',
    brand: product.brand || '', stock: product.stock || '', lowStockThreshold: product.lowStockThreshold || '5',
    tags: product.tags?.join(', ') || '', isFeatured: product.isFeatured || false, weight: product.weight || '',
    isPreOrder: product.isPreOrder || false, preOrderNote: product.preOrderNote || '', expectedDate: product.expectedDate || ''
  } : emptyForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.description) {
      toast.error('Name, price, category, and description are required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append('images', img));
      if (product) {
        await api.put(`/admin/products/${product._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '720px', maxHeight: '92vh', overflow: 'auto', padding: 'clamp(16px, 5vw, 36px)', margin: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 28px)', color: 'var(--navy)' }}>
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter product name" required />
          </div>

          <div className="admin-product-form">
            <div className="form-group">
              <label>Price (GHS) *</label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label>Compare Price (GHS)</label>
              <input name="comparePrice" type="number" step="0.01" min="0" value={form.comparePrice} onChange={handleChange} placeholder="Original price (optional)" />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {GHANA_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} placeholder="Brand name" />
            </div>
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <input name="shortDescription" value={form.shortDescription} onChange={handleChange} placeholder="Brief summary (shown in listings)" />
          </div>
          <div className="form-group">
            <label>Full Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Detailed product description..." required rows="4" />
          </div>

          <div className="admin-product-form">
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0" required />
            </div>
            <div className="form-group">
              <label>Low Stock Alert Level</label>
              <input name="lowStockThreshold" type="number" min="0" value={form.lowStockThreshold} onChange={handleChange} placeholder="5" />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. imported, quality" />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input name="weight" type="number" step="0.1" min="0" value={form.weight} onChange={handleChange} placeholder="0.0" />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="isFeatured" name="isFeatured" checked={form.isFeatured} onChange={handleChange} style={{ width: 'auto' }} />
            <label htmlFor="isFeatured" style={{ textTransform: 'none', letterSpacing: '0', cursor: 'pointer' }}>Feature this product on the homepage</label>
          </div>

          {/* Pre-Order */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="isPreOrder" name="isPreOrder" checked={form.isPreOrder} onChange={handleChange} style={{ width: 'auto' }} />
            <label htmlFor="isPreOrder" style={{ textTransform: 'none', letterSpacing: '0', cursor: 'pointer' }}>This is a Pre-Order product</label>
          </div>
          {form.isPreOrder && (
            <div className="admin-product-form">
              <div className="form-group">
                <label>Expected Delivery Date</label>
                <input name="expectedDate" value={form.expectedDate} onChange={handleChange} placeholder="e.g. 2-3 weeks, March 2025" />
              </div>
              <div className="form-group">
                <label>Pre-Order Note for Customers</label>
                <input name="preOrderNote" value={form.preOrderNote} onChange={handleChange} placeholder="e.g. Order now and receive once stock arrives" />
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="form-group">
            <label>Product Images</label>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: 'clamp(16px, 4vw, 32px)', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => fileRef.current.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files); setImages(files); setPreviews(files.map(f => URL.createObjectURL(f))); }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: '0 auto 10px' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p style={{ color: 'var(--text-mid)', fontSize: '14px' }}>Tap to upload images</p>
              <p style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '4px' }}>PNG, JPG up to 5MB. First image is main.</p>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
            </div>
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius)', border: '2px solid var(--border)' }} />
                    {i === 0 && <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'var(--gold)', color: 'var(--navy)', fontSize: '9px', padding: '1px 4px', fontWeight: '700' }}>MAIN</span>}
                  </div>
                ))}
              </div>
            )}
            {product?.images?.length > 0 && previews.length === 0 && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px' }}>Current images (upload new ones to replace):</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.images.map((img, i) => (
                    <img key={i} src={img.url} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius)', border: '2px solid var(--border)' }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StockModal({ product, onClose, onSave }) {
  const [stock, setStock] = useState(product.stock);
  const [threshold, setThreshold] = useState(product.lowStockThreshold);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/admin/products/${product._id}/stock`, { stock: Number(stock), lowStockThreshold: Number(threshold) });
      toast.success('Stock updated!');
      onSave();
    } catch { toast.error('Failed to update stock.'); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: 'clamp(20px, 5vw, 36px)', width: '100%', maxWidth: '400px', margin: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--navy)', marginBottom: '6px' }}>Update Stock</h3>
        <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '20px' }}>{product.name}</p>
        <div className="form-group">
          <label>Current Stock Quantity</label>
          <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Low Stock Alert Threshold</label>
          <input type="number" min="0" value={threshold} onChange={e => setThreshold(e.target.value)} />
          <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Notify when stock falls to or below this number</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving...' : 'Update Stock'}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/admin/products', { params: { page, search, category, limit: 20 } })
      .then(r => { setProducts(r.data.products); setPages(r.data.pages); setTotal(r.data.total); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [page, search, category]);

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try { await api.delete(`/admin/products/${id}`); toast.success('Product deactivated.'); fetchProducts(); }
    catch { toast.error('Failed to deactivate.'); }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="section-label">Administration</span>
            <h1>Product Management</h1>
            <p>{total} products total</p>
          </div>
          <button className="btn btn-gold" onClick={() => { setEditProduct(null); setShowModal(true); }}>
            + Add Product
          </button>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div className="admin-toolbar">
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ padding: '10px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', background: 'var(--white)' }}
          />
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            style={{ padding: '10px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', background: 'var(--white)' }}>
            <option value="">All Categories</option>
            {GHANA_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? <div className="loading-page"><div className="spinner" /></div> : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)', background: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p>No products found. Add your first product.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="admin-table-wrap order-table">
                <table>
                  <thead>
                    <tr style={{ background: 'var(--navy)' }}>
                      {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--gold)', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--white)' : 'var(--cream)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {p.images?.[0]?.url
                              ? <img src={p.images[0].url} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius)', flexShrink: 0 }} />
                              : <div style={{ width: '44px', height: '44px', background: 'var(--cream)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                </div>
                            }
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)', whiteSpace: 'nowrap' }}>{p.name}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>{p.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>{p.category}</td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy)' }}>GHS {p.price.toFixed(2)}</p>
                          {p.comparePrice && <p style={{ fontSize: '11px', color: 'var(--text-light)', textDecoration: 'line-through' }}>GHS {p.comparePrice.toFixed(2)}</p>}
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)' }}>{p.stock}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>alert at {p.lowStockThreshold}</p>
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ ...stockStatusStyle(p.stockStatus), padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                            {p.stockStatus?.replace('_', ' ')}
                          </span>
                          {p.isFeatured && <span className="badge badge-gold" style={{ marginLeft: '6px', fontSize: '9px' }}>Featured</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setEditProduct(p); setShowModal(true); }} title="Edit" style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 10px', cursor: 'pointer', color: 'var(--navy)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => setStockProduct(p)} title="Update stock" style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 10px', cursor: 'pointer', color: 'var(--navy)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                            </button>
                            <button onClick={() => handleDelete(p._id)} title="Deactivate" style={{ background: '#fdecea', border: '1px solid #fbc8c3', borderRadius: 'var(--radius)', padding: '6px 10px', cursor: 'pointer', color: 'var(--error)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="order-cards">
              {products.map(p => (
                <div key={p._id} className="order-card">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    {p.images?.[0]?.url
                      ? <img src={p.images[0].url} alt={p.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius)', flexShrink: 0 }} />
                      : <div style={{ width: '56px', height: '56px', background: 'var(--cream)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                    }
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{p.category}</p>
                    </div>
                  </div>
                  <div className="order-card-row"><span>Price</span><span style={{ fontWeight: '700', color: 'var(--navy)' }}>GHS {p.price.toFixed(2)}</span></div>
                  <div className="order-card-row"><span>Stock</span><span style={{ fontWeight: '600' }}>{p.stock} units</span></div>
                  <div className="order-card-row">
                    <span>Status</span>
                    <span style={{ ...stockStatusStyle(p.stockStatus), padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                      {p.stockStatus?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="order-card-row" style={{ border: 'none', paddingTop: '10px', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="btn btn-outline btn-sm">Edit</button>
                    <button onClick={() => setStockProduct(p)} className="btn btn-outline btn-sm">Stock</button>
                    <button onClick={() => handleDelete(p._id)} className="btn btn-sm" style={{ background: '#fdecea', border: '1px solid #fbc8c3', color: 'var(--error)' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {showModal && <ProductModal product={editProduct} onClose={() => { setShowModal(false); setEditProduct(null); }} onSave={() => { setShowModal(false); setEditProduct(null); fetchProducts(); }} />}
      {stockProduct && <StockModal product={stockProduct} onClose={() => setStockProduct(null)} onSave={() => { setStockProduct(null); fetchProducts(); }} />}
    </div>
  );
}