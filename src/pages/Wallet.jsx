import React, { useState, useEffect } from 'react';
import { IndianRupee, Clock, ArrowRight, AlertTriangle, ShieldCheck, CheckCircle2, History } from 'lucide-react';
import api from '../api';

const WalletPage = () => {
  const [wallet, setWallet] = useState({
      available_balance: '0.00',
      pending_balance: '0.00',
      payable_to_admin: '0.00',
      total_withdrawn: '0.00'
  });
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, withRes] = await Promise.all([
        api.get('sellers/wallet/'),
        api.get('sellers/withdrawals/')
      ]);
      if (walletRes.data.length > 0) {
        setWallet(walletRes.data[0]);
      }
      setWithdrawals(withRes.data.results || withRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    const val = parseFloat(amount);
    const max = parseFloat(wallet.available_balance) - parseFloat(wallet.payable_to_admin);

    if (isNaN(val) || val <= 0) return setError('Enter a valid amount.');
    if (val > max) return setError(`Maximum withdrawal is ₹${max.toFixed(2)} based on your available balance and COD dues.`);

    setLoading(true);
    try {
      await api.post('sellers/withdrawals/', { amount: val });
      setAmount('');
      fetchData();
      alert('Withdrawal request submitted!');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.[0] || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const maxAllowed = Math.max(0, parseFloat(wallet.available_balance) - parseFloat(wallet.payable_to_admin));

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Wallet & Earnings</h1>
        <p style={{ color: 'var(--text-dim)', fontWeight: 600, fontSize: '13px' }}>Manage your payouts and commission dues.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Main Balance Card */}
        <div style={{ background: '#0f172a', padding: '32px', borderRadius: '24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'var(--red-main)', filter: 'blur(60px)', opacity: 0.3, borderRadius: '50%' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#94a3b8' }}>
                <IndianRupee size={18} />
                <span style={{ fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available to Withdraw</span>
            </div>
            <div style={{ fontSize: '48px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                ₹{maxAllowed.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
                Total Available: ₹{wallet.available_balance}
            </div>
            {parseFloat(wallet.payable_to_admin) > 0 && (
                <div style={{ fontSize: '12px', color: '#fca5a5', marginTop: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <AlertTriangle size={14} />
                    Minus ₹{wallet.payable_to_admin} COD dues.
                </div>
            )}
        </div>

        {/* Withdrawal Form */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Request Withdrawal</h3>
            <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-dim)' }}>Amount (₹)</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Max: ₹${maxAllowed.toFixed(2)}`}
                        disabled={maxAllowed <= 0}
                        style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid var(--border)', fontSize: '16px', fontWeight: 600, outline: 'none', transition: 'border 0.2s' }}
                    />
                </div>
                {error && <div style={{ color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>{error}</div>}
                
                <div style={{ marginTop: 'auto' }}>
                    <button 
                        type="submit"
                        disabled={loading || maxAllowed <= 0}
                        style={{ width: '100%', padding: '16px', background: maxAllowed > 0 ? 'var(--red-main)' : 'var(--bg-sub)', color: maxAllowed > 0 ? '#fff' : 'var(--text-dim)', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: maxAllowed > 0 && !loading ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                    >
                        {loading ? 'Processing...' : 'Submit Request'} <ArrowRight size={18} />
                    </button>
                    {maxAllowed <= 0 && <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)', marginTop: '12px', fontWeight: 600 }}>Cannot withdraw at this time.</div>}
                </div>
            </form>
        </div>
      </div>

      {/* History */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <History size={20} color="var(--text-main)" />
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Withdrawal History</h2>
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-sub)', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                        <th style={{ padding: '16px', fontWeight: 800, fontSize: '12px', color: 'var(--text-main)', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '16px', fontWeight: 800, fontSize: '12px', color: 'var(--text-main)', textTransform: 'uppercase' }}>Amount</th>
                        <th style={{ padding: '16px', fontWeight: 800, fontSize: '12px', color: 'var(--text-main)', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '16px', fontWeight: 800, fontSize: '12px', color: 'var(--text-main)', textTransform: 'uppercase' }}>Payment Details</th>
                    </tr>
                </thead>
                <tbody>
                    {withdrawals.length === 0 ? (
                        <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)', fontWeight: 600 }}>No requests found.</td></tr>
                    ) : (
                        withdrawals.map((w) => (
                            <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '20px 16px', fontSize: '14px', fontWeight: 600, color: 'var(--text-dim)' }}>
                                    {new Date(w.requested_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '20px 16px', fontSize: '16px', fontWeight: 900, color: '#000' }}>
                                    ₹{w.amount}
                                </td>
                                <td style={{ padding: '20px 16px' }}>
                                    <span style={{
                                        padding: '6px 12px', borderRadius: '30px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        background: w.status === 'PENDING' ? '#FEF3C7' : w.status === 'PAID' ? '#D1FAE5' : '#FEE2E2',
                                        color: w.status === 'PENDING' ? '#D97706' : w.status === 'PAID' ? '#059669' : '#DC2626'
                                    }}>
                                        {w.status === 'PENDING' && <Clock size={12} />}
                                        {w.status === 'PAID' && <ShieldCheck size={12} />}
                                        {w.status}
                                    </span>
                                </td>
                                <td style={{ padding: '20px 16px', fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600 }}>
                                    {w.status === 'PAID' ? (
                                        <>
                                            <div style={{ color: 'var(--text-main)' }}>{w.payment_method?.replace('_', ' ')}</div>
                                            {w.transaction_id && <div>Ref: {w.transaction_id}</div>}
                                        </>
                                    ) : (
                                        'Awaiting processing'
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
