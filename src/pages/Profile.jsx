import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ShieldCheck,
  Upload,
  Building2,
  FileText,
  CreditCard,
  Camera,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Clock
} from 'lucide-react';

const Profile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('sellers/profiles/me/');
      setProfile(res.data);
      // Sync the user status/approval state in AuthContext
      updateUser({
        status: res.data.status,
        has_been_approved: res.data.has_been_approved
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setProfile(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      Object.keys(profile).forEach(key => {
        if (profile[key] instanceof File) {
          formData.append(key, profile[key]);
        } else if (profile[key] !== null && typeof profile[key] !== 'object') {
          formData.append(key, profile[key]);
        }
      });

      const res = await api.patch('sellers/profiles/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ type: 'success', text: 'Profile details submitted for verification successfully!' });
      // Sync the user status/approval state in AuthContext immediately after patch
      updateUser({
        status: res.data.status,
        has_been_approved: res.data.has_been_approved
      });
      fetchProfile();
    } catch (err) {
      console.error('Failed to save profile:', err);
      const errorData = err.response?.data;
      const errorMsg = typeof errorData === 'object'
        ? Object.entries(errorData).map(([k, v]) => `${k}: ${v}`).join(', ')
        : 'Update failed.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return '#059669';
      case 'REJECTED': return '#DC2626';
      default: return '#D97706';
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header & Status */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Business Profile</h1>
          <p style={{ color: 'var(--text-dim)', fontWeight: 600, fontSize: '13px' }}>Complete your mandatory business and legal details for verification.</p>
        </div>
        <div style={{
          padding: '8px 20px',
          background: `${getStatusColor(profile.status)}15`,
          color: getStatusColor(profile.status),
          borderRadius: '30px',
          fontWeight: 800,
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: `1px solid ${getStatusColor(profile.status)}30`
        }}>
          {profile.status === 'APPROVED' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
          Verification Status: {profile.status || 'PENDING'}
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '16px 20px',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#065F46' : '#991B1B',
          borderRadius: 'var(--radius-md)',
          marginBottom: '32px',
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `1px solid ${message.type === 'success' ? '#10B98130' : '#EF444430'}`
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {profile.status === 'APPROVED' && (
        <div style={{
          padding: '20px',
          background: '#F0F9FF',
          color: '#0369A1',
          borderRadius: 'var(--radius-md)',
          marginBottom: '32px',
          display: 'flex',
          gap: '16px',
          border: '1px solid #0EA5E930'
        }}>
          <ShieldCheck size={24} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>Verified Account</div>
            <p style={{ fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>Your documents have been verified. You can still update details if needed, but major changes might trigger a re-verification process.</p>
          </div>
        </div>
      )}

      {profile.status !== 'APPROVED' && (
        <div style={{
          padding: '20px',
          background: profile.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB',
          color: profile.status === 'REJECTED' ? '#991B1B' : '#92400E',
          borderRadius: 'var(--radius-md)',
          marginBottom: '32px',
          display: 'flex',
          gap: '16px',
          border: `1px solid ${profile.status === 'REJECTED' ? '#EF444430' : '#F59E0B30'}`
        }}>
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>
              {profile.status === 'REJECTED' ? 'Application Rejected' : 'Verification Under Review'}
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', lineHeight: '1.5' }}>
              {profile.status === 'REJECTED' ? (
                "Your seller account has been rejected by the administrator. Please update your details and resubmit."
              ) : profile.has_been_approved ? (
                "Your profile changes are under admin review. Access to seller features will be restored after approval."
              ) : (
                "Your seller account is currently under admin review. Access to the Seller Dashboard will be enabled once your account has been approved."
              )}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Section 1: Business Identity */}
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Building2 size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Business & Legal Identity</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Business Name</label>
              <input
                name="business_name"
                value={profile.business_name || ''}
                onChange={handleChange}
                placeholder="Real Name or Entity Name"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-sub)' }}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>GST Number (15 Chars)</label>
              <input
                name="gst_number"
                value={profile.gst_number || ''}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-sub)' }}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>PAN Number (10 Chars)</label>
              <input
                name="pan_number"
                value={profile.pan_number || ''}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-sub)' }}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Aadhaar Number (12 Digits)</label>
              <input
                name="aadhaar_number"
                value={profile.aadhaar_number || ''}
                onChange={handleChange}
                placeholder="1234 5678 9012"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-sub)' }}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Shop License / Registration No.</label>
              <input
                name="shop_license_number"
                value={profile.shop_license_number || ''}
                onChange={handleChange}
                placeholder="Registration Number"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-sub)' }}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--purple-main)' }}>Platform Commission</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', 
                    background: 'rgba(111, 66, 193, 0.05)', border: '1px solid rgba(111, 66, 193, 0.2)',
                    fontSize: '15px', fontWeight: 800, color: 'var(--purple-main)', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <Shield size={16} /> {profile.commission}%
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', fontWeight: 600 }}>Commission Rate</p>
                </div>
                <div>
                  <div style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', 
                    background: 'rgba(111, 66, 193, 0.05)', border: '1px solid rgba(111, 66, 193, 0.2)',
                    fontSize: '15px', fontWeight: 800, color: 'var(--purple-main)', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    ₹{profile.commission_amt}
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', fontWeight: 600 }}>Fixed Amount</p>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px', fontWeight: 600 }}>This is your current platform fee structure.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Banking Details */}
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <CreditCard size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Banking Details (For Payouts)</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Account Holder Name</label>
              <input
                name="bank_account_name"
                value={profile.bank_account_name || ''}
                onChange={handleChange}
                placeholder="As per bank records"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-sub)' }}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Bank Name</label>
              <input
                name="bank_name"
                value={profile.bank_name || ''}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-sub)' }}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Account Number</label>
              <input
                name="bank_account_number"
                value={profile.bank_account_number || ''}
                onChange={handleChange}
                placeholder="Your Savings/Current Acc No"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-sub)' }}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>IFSC Code</label>
              <input
                name="bank_ifsc"
                value={profile.bank_ifsc || ''}
                onChange={handleChange}
                placeholder="HDFC0001234"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-sub)' }}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Account Type</label>
              <select
                name="bank_account_type"
                value={profile.bank_account_type || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-sub)', fontWeight: 600 }}
              >
                <option value="">Select Account Type</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Overdraft">Overdraft</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Document Uploads */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>

          <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <FileText size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Legal Documents</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FileUpload label="PAN Card Copy" name="pan_card_copy" current={profile.pan_card_copy} onChange={handleFileChange} />
              <FileUpload label="Aadhaar Front/Back" name="aadhaar_card_copy" current={profile.aadhaar_card_copy} onChange={handleFileChange} />
              <FileUpload label="Shop License Copy" name="shop_license_copy" current={profile.shop_license_copy} onChange={handleFileChange} />
              <FileUpload label="Authorized Letter" name="authorized_letter" current={profile.authorized_letter} onChange={handleFileChange} />
              <div style={{ gridColumn: 'span 2' }}>
                <FileUpload label="Bank Passbook/Cancelled Cheque" name="bank_passbook_copy" current={profile.bank_passbook_copy} onChange={handleFileChange} />
              </div>
            </div>
          </div>

          <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Camera size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Visual Verification</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FileUpload label="Person Image (Selfie)" name="owner_image" current={profile.owner_image} onChange={handleFileChange} isImage />
              <FileUpload label="Shop Front Image" name="shop_image" current={profile.shop_image} onChange={handleFileChange} isImage />
            </div>
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-sub)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>
              <p>• Images should be clear and well-lit.</p>
              <p>• Shop image must show the store board clearly.</p>
              <p>• Max file size: 5MB per document.</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'var(--text-main)',
              color: '#fff',
              padding: '16px 48px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              opacity: saving ? 0.7 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }}
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
            {profile.status === 'APPROVED' ? 'Update Details' : 'Submit for Verification'}
          </button>
        </div>

      </form>
    </div>
  );
};

const FileUpload = ({ label, name, current, onChange, isImage }) => {
  const [preview, setPreview] = useState(null);
  const isExisting = typeof current === 'string' && current.startsWith('http');

  useEffect(() => {
    if (current instanceof File) {
      const url = URL.createObjectURL(current);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [current]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)' }}>{label}</label>
      <div
        className="upload-box"
        onClick={() => document.getElementById(name).click()}
      >
        {isExisting || preview ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img src={preview || current} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-overlay">
              <Upload color="#fff" size={20} />
            </div>
            <style>{`.upload-box:hover .hover-overlay { opacity: 1 !important; }`}</style>
          </div>
        ) : (
          <div className="upload-label">
            {isImage ? <ImageIcon size={24} /> : <Upload size={24} />}
            <span>Click to Upload</span>
          </div>
        )}
        <input
          id={name}
          type="file"
          name={name}
          onChange={onChange}
          hidden
          accept={isImage ? "image/*" : ".pdf,.doc,.docx,image/*"}
        />
      </div>
    </div>
  );
};

export default Profile;
