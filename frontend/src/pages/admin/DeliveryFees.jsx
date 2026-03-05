import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const REGIONS = ['Greater Accra','Ashanti','Western','Central','Eastern','Northern','Upper East','Upper West','Volta','Brong-Ahafo','North East','Savannah','Oti','Bono East','Ahafo','Western North'];

export default function DeliveryFees() {
  const [fees, setFees] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/delivery-fees').then(r => setFees(r.data.fees || {})).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChange = (region, value) => {
    setFees(f => ({ ...f, [region]: value === '' ? 0 : Number(value) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/delivery-fees', { fees });
      toast.success('Delivery fees saved!');
    } catch { toast.error('Failed to save fees.'); } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/></div>;

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--navy)', padding: '32px 0' }}>
        <div className="container">
          <span className="section-label">Administration</span>
          <h1 style={{ color: 'var(--white)', fontSize: 'clamp(22px,3vw,32px)', margin: '8px 0 4px' }}>Delivery Fees</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Set delivery fees per region. Customers will see the fee when they select their region at checkout.</p>
        </div>
      </div>
      <div className="container" style={{ padding: '32px 24px', maxWidth: '700px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--navy)' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--gold)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Region</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--gold)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Delivery Fee (GHS)</th>
              </tr>
            </thead>
            <tbody>
              {REGIONS.map((region, i) => (
                <tr key={region} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--white)' : 'var(--cream)' }}>
                  <td style={{ padding: '12px 20px', fontWeight: '600', color: 'var(--navy)', fontSize: '14px' }}>{region}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>GHS</span>
                      <input
                        type="number"
                        min="0"
                        step="0.50"
                        value={fees[region] !== undefined ? fees[region] : ''}
                        onChange={e => handleChange(region, e.target.value)}
                        placeholder="0.00"
                        style={{ width: '100px', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '600', color: 'var(--navy)' }}
                      />
                      {fees[region] === 0 && <span style={{ fontSize: '12px', color: '#1a7a4a', fontWeight: '600' }}>FREE</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: '160px' }}>
            {saving ? 'Saving...' : 'Save All Fees'}
          </button>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', alignSelf: 'center' }}>Set a fee to 0 for free delivery to that region.</p>
        </div>
      </div>
    </div>
  );
}