import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Shield,
  IndianRupee,
  ShoppingCart
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <div className="animate-fade-in card-minimal" style={{
    background: `${color}20`,
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
    border: `1px solid ${color}35`,
    boxShadow: `0 4px 6px -1px ${color}15, 0 2px 4px -1px ${color}10`,
    animationDelay: `${delay}s`,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{
        width: '44px',
        height: '44px',
        background: `${color}30`,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon color={color} size={22} />
      </div>
      <div style={{
        padding: '4px 12px',
        background: 'var(--bg-sub)',
        borderRadius: '30px',
        fontSize: '11px',
        fontWeight: 800,
        color: 'var(--text-dim)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}>
        Activity
      </div>
    </div>
    <div>
      <h3 style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '4px' }}>{title}</h3>
      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, in_progress: 0 });
  const [earnings, setEarnings] = useState('0.00');
  const [commission, setCommission] = useState('0.00');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setStatsLoading(true);
    setWalletLoading(true);
    setProfileLoading(true);

    // 1. Fetch Stats & Orders
    api.get('orders/stats/')
      .then(res => setStats(res.data))
      .catch(err => console.error('Stats fetch failed', err))
      .finally(() => setStatsLoading(false));

    api.get('orders/')
      .then(res => {
        const orders = Array.isArray(res.data) ? res.data : res.data.results || [];
        const sortedOrders = [...orders].sort((a, b) => (b.id || 0) - (a.id || 0));
        setRecentOrders(sortedOrders.slice(0, 5));
      })
      .catch(err => console.error('Orders fetch failed', err))
      .finally(() => setLoading(false));

    // 2. Fetch Wallet
    api.get('sellers/wallet/')
      .then(res => {
        const walletData = res.data.results || res.data;
        setEarnings(walletData[0]?.total_earned || '0.00');
      })
      .catch(err => console.error('Wallet fetch failed', err))
      .finally(() => setWalletLoading(false));

    // 3. Fetch Profile
    api.get('sellers/profiles/me/')
      .then(res => setCommission(res.data.commission || '0.00'))
      .catch(err => console.error('Profile fetch failed', err))
      .finally(() => setProfileLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasPending = stats.pending > 0;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Dashboard Overview</h1>
          <p style={{ color: 'red', fontWeight: 600, fontSize: '13px' }}>Monitor your performance metrics.</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            background: 'var(--text-main)', 
            color: '#fff', 
            borderRadius: 'var(--radius-sm)', 
            border: 'none', 
            fontWeight: 700, 
            fontSize: '13px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
          <TrendingUp size={16} />
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '40px'
      }}>
        <StatCard title="Assigned Orders" value={statsLoading ? '...' : stats.total} icon={ShoppingBag} color="#020617" delay={0.1} />
        <StatCard title="Pending Review" value={statsLoading ? '...' : stats.pending} icon={Clock} color="#D97706" delay={0.2} />
        <StatCard title="Total Earnings" value={walletLoading ? '...' : `₹${parseFloat(earnings).toLocaleString()}`} icon={IndianRupee} color="#059669" delay={0.3} />
        <StatCard title="Commission Rate" value={profileLoading ? '...' : `${commission}%`} icon={Shield} color="#7C3AED" delay={0.4} />
        <StatCard title="Completed" value={statsLoading ? '...' : stats.completed} icon={CheckCircle2} color="#2563EB" delay={0.5} />
      </div>

      <div className="hover-lift" style={{
        background: hasPending ? 'var(--bg-sub)' : '#fff',
        padding: '28px 32px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: hasPending ? 'var(--primary)' : 'var(--text-main)' }}>
            {hasPending ? 'Ready to work?' : "You're all caught up!"}
          </h3>
          <p style={{ color: 'var(--text-dim)', fontWeight: 600, fontSize: '14px' }}>
            {hasPending
              ? `You have ${stats.pending} new orders waiting for your attention.`
              : 'There are no pending assignments at the moment. Great job!'}
          </p>
        </div>
        <Link
          to="/orders"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: hasPending ? 'var(--text-main)' : 'transparent',
            color: hasPending ? '#fff' : 'var(--text-dim)',
            padding: '12px 24px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '14px',
            border: hasPending ? 'none' : '1px solid var(--border)',
            transition: 'all 0.2s ease'
          }}
        >
          {hasPending ? 'View Orders' : 'Check Orders'}
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Recent Orders</h2>
          {loading && <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>Syncing with server...</div>}
        </div>
        
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: 'var(--text-dim)' }}>
              <div className="animate-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)' }}></div>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Fetching your latest assignments...</span>
            </div>
          ) : recentOrders.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-sub)' }}>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Order ID</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Customer</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Address</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Date/Time</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Items</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-lift">
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>#{order.id}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-dim)', fontWeight: 500 }}>
                      <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>{order.customer_name || 'N/A'}</div>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>{order.customer_phone || 'No Phone'}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-dim)' }}>
                      <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.shipping_address || 'No Address'}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-dim)' }}>
                      <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}</div>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>{order.delivery_time || 'Anytime'}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-dim)' }}>
                      <div style={{ background: 'var(--bg-sub)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', fontWeight: 600, fontSize: '12px', color: 'var(--text-dim)' }}>
                        {order.items?.length || 0} Item(s)
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: order.status === 'OUT_FOR_DELIVERY' ? '#FEF3C7' : (['ASSIGNED', 'PENDING'].includes(order.status) ? '#DBEAFE' : 'var(--bg-sub)'),
                        color: order.status === 'OUT_FOR_DELIVERY' ? '#92400E' : (['ASSIGNED', 'PENDING'].includes(order.status) ? '#1E40AF' : 'var(--text-dim)'),
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', textAlign: 'center', color: '#94A3B8', flexDirection: 'column', gap: '8px' }}>
              <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>No assignments yet</div>
              <div style={{ fontSize: '13px', maxWidth: '300px' }}>When an admin assigns an order to you, it will appear here instantly.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
