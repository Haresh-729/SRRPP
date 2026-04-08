import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IconRefresh, IconCalendarMonth, IconArrowForwardUp, IconReceipt } from '@tabler/icons-react';
import { listLedgers } from '../../../../services/repository/PaymentRepo.js';

const fmtMonth = (s) => { if (!s) return '—'; const [y, m] = s.split('-'); return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); };
const today = new Date().toISOString().split('T')[0];

// Get current month as YYYY-MM
const getCurrentMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

// Build list of months within agreement duration (current + future)
const buildAvailableMonths = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const months = [];
  const cur = new Date(now.getFullYear(), now.getMonth(), 1); // current month
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl border"
    style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
    </div>
  </div>
);

const RecordPaymentTab = ({ properties, agreements: allAgreements, onRecordRegular, onRecordAdvance, onSuccess }) => {
  const dispatch = useDispatch();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [filteredAgreements, setFilteredAgreements] = useState([]);
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentMonth = getCurrentMonth();
  const isCurrentMonth = selectedMonth === currentMonth;

  // Filter agreements based on selected property
  useEffect(() => {
    if (!selectedProperty) {
      setFilteredAgreements([]);
      setSelectedAgreement('');
      setAvailableMonths([]);
      setSelectedMonth('');
      setLedgerData(null);
      return;
    }

    const filtered = allAgreements.filter(a => a.property_id === selectedProperty && a.status === 'ACTIVE');
    setFilteredAgreements(filtered);
    setSelectedAgreement('');
    setAvailableMonths([]);
    setSelectedMonth('');
    setLedgerData(null);
  }, [selectedProperty, allAgreements]);

  // Build available months when agreement is selected
  useEffect(() => {
    if (!selectedAgreement) {
      setAvailableMonths([]);
      setSelectedMonth('');
      setLedgerData(null);
      return;
    }

    const agreement = filteredAgreements.find(a => a.id === selectedAgreement);
    if (agreement) {
      const months = buildAvailableMonths(agreement.start_date, agreement.end_date);
      setAvailableMonths(months);
      setSelectedMonth('');
      setLedgerData(null);
    }
  }, [selectedAgreement, filteredAgreements]);

  // Fetch ledger data when month is selected
  useEffect(() => {
    if (!selectedMonth || !selectedAgreement) return;

    const fetchLedger = async () => {
      setLoading(true);
      setError(null);
      try {
        // For current/past months, fetch from ledgers
        if (selectedMonth <= currentMonth) {
          const result = await dispatch(listLedgers({
            agreementId: selectedAgreement,
            month: selectedMonth,
            limit: 1,
          }));
          if (result?.data?.length > 0) {
            setLedgerData(result.data[0]);
          } else {
            setError('No ledger found for this month.');
            setLedgerData(null);
          }
        } else {
          // For future months, don't fetch 
          setLedgerData(null);
        }
      } catch (err) {
        setError('Failed to fetch ledger data.');
        setLedgerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [selectedMonth, selectedAgreement, dispatch, currentMonth]);

  const selectedAgreementObj = filteredAgreements.find(a => a.id === selectedAgreement);
  const selectedPropertyObj = properties.find(p => p.id === selectedProperty);

  const handleRecord = () => {
    if (!selectedAgreementObj || !selectedMonth) return;

    if (isCurrentMonth) {
      // Regular payment - use existing ledger
      if (ledgerData) {
        onRecordRegular(ledgerData);
      }
    } else {
      // Future payment (advance)
      onRecordAdvance(selectedAgreementObj, selectedMonth);
    }
  };

  const canRecord = selectedProperty && selectedAgreement && selectedMonth && 
    (isCurrentMonth ? ledgerData : true);

  const selStyle = { borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={IconCalendarMonth} label="Selected Month" value={selectedMonth ? fmtMonth(selectedMonth) : 'None'} color="var(--brand-primary)" />
        <StatCard icon={selectedMonth && isCurrentMonth ? IconReceipt : IconArrowForwardUp} label="Payment Type" value={selectedMonth ? (isCurrentMonth ? 'Regular' : 'Advance') : '—'} color={isCurrentMonth ? 'var(--success)' : 'var(--warning)'} />
      </div>

      {/* Selection Card */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
        {/* Selectors */}
        <div className="p-5 space-y-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          {/* Property Selector */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Property *</label>
            <select
              value={selectedProperty}
              onChange={e => setSelectedProperty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
              style={selStyle}>
              <option value="">Select Property</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Agreement Selector */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Agreement *</label>
            <select
              value={selectedAgreement}
              onChange={e => setSelectedAgreement(e.target.value)}
              disabled={!selectedProperty}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none disabled:opacity-50"
              style={selStyle}>
              <option value="">Select Agreement</option>
              {filteredAgreements.map(a => (
                <option key={a.id} value={a.id}>
                  {a.tenants?.full_name} — {a.properties?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Month *</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              disabled={!selectedAgreement}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none disabled:opacity-50"
              style={selStyle}>
              <option value="">Select Month</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>
                  {fmtMonth(m)} {m === currentMonth ? '(Current)' : '(Future)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Details Section */}
        {selectedMonth && (
          <div className="p-5 border-b" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
              </div>
            ) : isCurrentMonth ? (
              <>
                {error ? (
                  <div className="text-center">
                    <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
                  </div>
                ) : ledgerData ? (
                  <div className="space-y-3">
                    <div className="text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Tenant: </span>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{ledgerData.tenants?.full_name}</span>
                    </div>
                    <div className="text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Total Due: </span>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{Number(ledgerData.total_due || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Paid: </span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{Number(ledgerData.paid_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Outstanding: </span>
                      <span style={{ color: Math.max(ledgerData.total_due - ledgerData.paid_amount, 0) > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                        ₹{Number(Math.max(ledgerData.total_due - ledgerData.paid_amount, 0)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>No ledger data available</p>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Tenant: </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedAgreementObj?.tenants?.full_name}</span>
                </div>
                <div className="px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }}>
                  This will be recorded as an Advance Payment for {fmtMonth(selectedMonth)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="p-5 flex gap-2">
          <button
            onClick={handleRecord}
            disabled={!canRecord}
            className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canRecord ? 'var(--brand-primary)' : 'var(--surface-bg)',
              color: canRecord ? 'var(--text-inverse)' : 'var(--text-muted)',
            }}>
            <span className="inline-flex items-center gap-2">
              {isCurrentMonth ? <IconReceipt size={15} /> : <IconArrowForwardUp size={15} />}
              {isCurrentMonth ? 'Record Regular Payment' : 'Record Advance Payment'}
            </span>
          </button>
          <button
            onClick={() => {
              setSelectedProperty('');
              setSelectedAgreement('');
              setSelectedMonth('');
              setFilteredAgreements([]);
              setAvailableMonths([]);
              setLedgerData(null);
            }}
            className="px-4 py-2.5 rounded-lg font-semibold text-sm"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--surface-border)',
              color: 'var(--text-muted)',
              border: '1px solid var(--surface-border)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <IconRefresh size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordPaymentTab;
