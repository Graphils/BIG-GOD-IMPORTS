import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import '../../styles/admin.css';
const REGIONS = ['Greater Accra','Ashanti','Western','Central','Eastern','Northern','Upper East','Upper West','Volta','Brong-Ahafo','North East','Savannah','Oti','Bono East','Ahafo','Western North'];
function FeesTab({ title, fetchUrl, saveUrl, color = 'var(--navy)', note }) {
  const [fees, setFees] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.get(fetchUrl)
      .then(r => setFees(r.data.fees || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchUrl]);
  const handleChange = (region, value) => {
    setFees(f => ({ ...f, [region]: value === '' ? '' : Number(value) }));
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanFees = {};
      REGIONS.forEach(r => { cleanFees[r] = Number(fees[r]) || 0; });
      await api.put(saveUrl, { fees: cleanFees });
      toast.success(`${title} updated!`);
    } catch {
      toast.error('Failed to save.');
    } finally { setSaving(false); }
  };
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  return (
    <div>
      {note && (
        <div style={{ background: '#f0f7ff', border: '1px solid #b3d4f5', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '24px', fontSize: '13px', color: '#1a5c9a' }}>
          {note}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {REGIONS.map(region => (
          <div key={region} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--navy)', flex: 1 }}>{region}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>GHS</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fees[region] ?? ''}
                onChange={e => handleChange(region, e.target.value)}
                style={{ width: '80px', padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '600', color, textAlign: 'right' }}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        className="btn btn-primary"
        style={{ marginTop: '24px' }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : `Save ${title}`}
      </button>
    </div>
  );
}
export default function AdminDeliveryFees() {
  const [tab, setTab] = useState('regular');
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <span className="section-label">Administration</span>
          <h1>Delivery Fee Management</h1>
          <p>Set shipping fees per region for regular and pre-order items.</p>
        </div>
      </div>
      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
          <button
            onClick={() => setTab('regular')}
            style={{
              padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              background: 'none', borderBottom: tab === 'regular' ? '2px solid var(--navy)' : '2px solid transparent',
              color: tab === 'regular' ? 'var(--navy)' : 'var(--text-light)', marginBottom: '-2px', transition: 'all 0.2s'
            }}
          >

 Regular Delivery
          </button>
          <button
            onClick={() => setTab('preorder')}
            style={{
              padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              background: 'none', borderBottom: tab === 'preorder' ? '2px solid #6a1b9a' : '2px solid transparent',
              color: tab === 'preorder' ? '#6a1b9a' : 'var(--text-light)', marginBottom: '-2px', transition: 'all 0.2s'
            }}
          >

 Pre-Order Shipping
          </button>
        </div>
        {tab === 'regular' && (
          <FeesTab
            title="Regular Delivery Fees"
            fetchUrl="/delivery-fees"
            saveUrl="/admin/delivery-fees"
            color="var(--navy)"
            note="These fees apply to regular in-stock items at checkout."
          />
        )}
        {tab === 'preorder' && (
          <FeesTab
            title="Pre-Order Shipping Fees"
            fetchUrl="/pre-order-delivery-fees"
            saveUrl="/admin/pre-order-delivery-fees"
            color="#6a1b9a"
            note="These shipping fees apply to pre-order items at checkout. Set to 0 for free shipping on any region."
          />
        )}
      </div>
    </div>
  );
}