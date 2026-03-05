import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import './Shop.css';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'popular-desc', label: 'Most Popular' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'createdAt-desc';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true';

  const setParam = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set(key, val); else newParams.delete(key);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  useEffect(() => {
    api.get('/products/categories').then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const [sortField, sortOrder] = sort.split('-');
    api.get('/products', { params: { page, limit: 12, category, search, sort: sortField, order: sortOrder, minPrice, maxPrice, inStock: inStock || '' } })
      .then(r => { setProducts(r.data.products); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div>
      <div className="page-title">
        <div className="container">
          <div className="breadcrumb"><a href="/">Home</a><span>/</span><span>Shop</span></div>
          <h1>Our Products</h1>
          {search && <p style={{color:'rgba(255,255,255,0.6)',marginTop:'8px'}}>Results for: <strong style={{color:'var(--gold)'}}>{search}</strong></p>}
        </div>
      </div>

      <div className="container shop-layout">
        {/* SIDEBAR FILTERS */}
        <aside className={`shop-sidebar${filtersOpen ? ' open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="sidebar-close" onClick={() => setFiltersOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="filter-group">
            <h4>Categories</h4>
            <button className={`filter-cat${!category ? ' active' : ''}`} onClick={() => setParam('category','')}>All Products</button>
            {categories.map(cat => (
              <button key={cat} className={`filter-cat${category === cat ? ' active' : ''}`} onClick={() => setParam('category', cat)}>{cat}</button>
            ))}
          </div>
          <div className="filter-group">
            <h4>Price Range (GHS)</h4>
            <div className="price-range">
              <input type="number" placeholder="Min" value={minPrice} onChange={e => setParam('minPrice', e.target.value)} min="0" />
              <span>—</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={e => setParam('maxPrice', e.target.value)} min="0" />
            </div>
          </div>
          <div className="filter-group">
            <h4>Availability</h4>
            <label className="filter-check">
              <input type="checkbox" checked={inStock} onChange={e => setParam('inStock', e.target.checked ? 'true' : '')} />
              <span>In Stock Only</span>
            </label>
          </div>
          {(category || minPrice || maxPrice || inStock) && (
            <button className="btn btn-outline btn-sm" onClick={() => setSearchParams({})} style={{marginTop:'16px',width:'100%'}}>Clear All Filters</button>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <div className="shop-main">
          <div className="shop-toolbar">
            <p className="results-count"><strong>{total}</strong> product{total !== 1 ? 's' : ''} found</p>
            <div className="toolbar-right">
              <select className="sort-select" value={sort} onChange={e => setParam('sort', e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button className="filter-toggle btn btn-outline btn-sm" onClick={() => setFiltersOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filters
              </button>
            </div>
          </div>

          {loading ? <div className="spinner" /> : products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {pages > 1 && (
                <div className="pagination">
                  {page > 1 && <button onClick={() => setParam('page', page-1)}>←</button>}
                  {Array.from({length: Math.min(pages,7)}, (_,i) => {
                    const p = i + 1;
                    return <button key={p} className={page === p ? 'active' : ''} onClick={() => setParam('page', p)}>{p}</button>;
                  })}
                  {page < pages && <button onClick={() => setParam('page', page+1)}>→</button>}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="btn btn-primary" onClick={() => setSearchParams({})}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
