import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  FileText,
  FileDown,
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  CreditCard,
  Mail,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let url = 'invoices/';
      const params = new URLSearchParams();
      if (statusFilter) params.append('payment_status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      const data = res.data.results || res.data;
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError('Could not load invoice history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleDownload = async (invoiceId) => {
    try {
      const response = await api.get(`invoices/${invoiceId}/download_pdf/`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download PDF.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Invoices & Billing</h1>
          <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>Download your sales invoices and track earnings.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search INV#, Email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px 16px 10px 40px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  width: '240px',
                  outline: 'none',
                  fontWeight: 600
                }}
              />
              <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </form>
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '13px',
              background: '#fff',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            <option value="">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sub)' }}>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Invoice ID</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Customer</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Financials</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}>Status</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '80px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                      <span style={{ fontWeight: 600, color: 'var(--text-dim)', fontSize: '14px' }}>Loading ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '80px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-dim)' }}>
                      <AlertCircle size={40} strokeWidth={1} />
                      <span style={{ fontWeight: 600 }}>No invoices found.</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-lift">
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '14px' }}>{inv.invoice_id}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Calendar size={12} /> {new Date(inv.invoice_date).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', fontWeight: 600 }}>Order #{inv.order}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{inv.customer_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <Mail size={12} /> {inv.customer_email}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '14px' }}>₹{inv.total_amount}</div>
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
                      Earnings: ₹{inv.seller_amount}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                      (Comm: ₹{inv.commission_amount})
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      background: inv.payment_status === 'PAID' ? '#D1FAE5' : '#FEF3C7',
                      color: inv.payment_status === 'PAID' ? '#065F46' : '#92400E',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 800,
                      border: '1px solid currentColor'
                    }}>
                      {inv.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDownload(inv.id)}
                      style={{ 
                        background: 'var(--text-main)', color: '#fff', border: 'none', 
                        padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '12px', 
                        fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
                        alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                      }}
                    >
                      <FileDown size={14} />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
