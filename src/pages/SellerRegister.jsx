import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building2, 
  FileText, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  MapPin,
  Landmark,
  FileCheck
} from 'lucide-react';

const SellerRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    business_name: '',
    gst_number: '',
    pan_number: '',
    aadhaar_number: '',
    shop_license_number: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_name: '',
    business_address: ''
  });

  const [files, setFiles] = useState({
    pan_card_copy: null,
    aadhaar_card_copy: null,
    shop_license_copy: null,
    bank_passbook_copy: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      
      // Hardcode role as SELLER
      data.append('role', 'SELLER');

      // Append files
      Object.entries(files).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      await api.post('users/register/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Registration failed:', err);
      const errorData = err.response?.data;
      if (typeof errorData === 'object') {
        // Flatten error object for display
        const errorMessages = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(' | ');
        setError(errorMessages || 'Registration failed. Please check all fields.');
      } else {
        setError('Registration failed. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-sub)', padding: '20px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-minimal" 
          style={{ textAlign: 'center', maxWidth: '450px', width: '100%', padding: '48px', borderRadius: 'var(--radius-lg)' }}
        >
          <div style={{ width: '80px', height: '80px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 color="#10B981" size={40} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)' }}>Registration Successful!</h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: '32px', fontSize: '16px', lineHeight: '1.6' }}>
            Your seller application has been received and is pending admin approval. You'll be redirected to the login page shortly.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--primary)', fontWeight: 700 }}>
             <Loader2 className="animate-spin" size={20} />
             <span>Redirecting to Login...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-sub)', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#FFF1F0', color: 'var(--primary)', borderRadius: '100px', fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>
              <ShieldCheck size={16} />
              BECOME A SELLER
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>Partner with Us</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Complete the form below to register your business and start selling on our platform.</p>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* 1. Personal Details */}
            <Section title="Personal Details" icon={User} delay={0.1}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleInputChange} required placeholder="Enter first name" />
                <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleInputChange} required placeholder="Enter last name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <Input label="Username" name="username" value={formData.username} onChange={handleInputChange} icon={User} required placeholder="Choose a username" />
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} icon={Mail} required placeholder="email@example.com" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <Input label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} icon={Lock} required placeholder="••••••••" />
                <Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} icon={Phone} required placeholder="+91 XXXXX XXXXX" />
              </div>
            </Section>

            {/* 2. Business Details */}
            <Section title="Business Details" icon={Briefcase} delay={0.2}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleInputChange} icon={Building2} required placeholder="Legal business name" />
                <Input label="GST Number" name="gst_number" value={formData.gst_number} onChange={handleInputChange} icon={FileText} required placeholder="22AAAAA0000A1Z5" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                <Input label="PAN Number" name="pan_number" value={formData.pan_number} onChange={handleInputChange} required placeholder="ABCDE1234F" />
                <Input label="Aadhar Number" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} required placeholder="12-digit number" />
                <Input label="Shop License No." name="shop_license_number" value={formData.shop_license_number} onChange={handleInputChange} required placeholder="License number" />
              </div>
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Business Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                  <textarea 
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter complete business address..."
                    style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '15px', minHeight: '100px', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
            </Section>

            {/* 3. Bank Details */}
            <Section title="Bank Details" icon={Landmark} delay={0.3}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Input label="Bank Account Name" name="bank_account_name" value={formData.bank_account_name} onChange={handleInputChange} required placeholder="Name as per bank records" />
                <Input label="Bank Name" name="bank_name" value={formData.bank_name} onChange={handleInputChange} required placeholder="e.g. HDFC Bank" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginTop: '20px' }}>
                <Input label="Account Number" name="bank_account_number" value={formData.bank_account_number} onChange={handleInputChange} icon={CreditCard} required placeholder="XXXXXXXXXXXXXX" />
                <Input label="IFSC Code" name="bank_ifsc" value={formData.bank_ifsc} onChange={handleInputChange} required placeholder="HDFC0001234" />
              </div>
            </Section>

            {/* 4. Documents */}
            <Section title="Document Uploads" icon={FileCheck} delay={0.4}>
              <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '24px' }}>Please upload clear copies of the following documents (PDF, JPG, or PNG).</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <FileInput label="PAN Card Copy" name="pan_card_copy" onChange={handleFileChange} required fileName={files.pan_card_copy?.name} />
                <FileInput label="Aadhar Card Copy" name="aadhaar_card_copy" onChange={handleFileChange} required fileName={files.aadhaar_card_copy?.name} />
                <FileInput label="Shop License Copy" name="shop_license_copy" onChange={handleFileChange} required fileName={files.shop_license_copy?.name} />
                <FileInput label="Bank Passbook Copy" name="bank_passbook_copy" onChange={handleFileChange} required fileName={files.bank_passbook_copy?.name} />
              </div>
            </Section>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '16px 20px', background: '#FFF1F0', border: '1px solid #FFA39E', color: '#CF1322', borderRadius: 'var(--radius-md)', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px', fontWeight: 600 }}>
                    <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px' }}>Registration Error</strong>
                      {error}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  width: '100%', 
                  maxWidth: '400px', 
                  padding: '18px 32px', 
                  borderRadius: 'var(--radius-lg)', 
                  background: loading ? 'var(--text-dim)' : 'var(--primary)', 
                  color: '#fff', 
                  fontWeight: 800, 
                  fontSize: '18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 10px 20px -10px rgba(255, 59, 48, 0.5)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className={loading ? '' : 'hover-lift'}
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                {loading ? 'Processing Application...' : 'Submit Application'}
                {!loading && <ArrowRight size={20} />}
              </button>
              
              <p style={{ fontSize: '15px', color: 'var(--text-dim)', fontWeight: 600 }}>
                Already a partner? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline' }}>Login here</Link>
              </p>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

const Section = ({ title, icon: Icon, children, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{ background: '#fff', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ padding: '10px', background: 'var(--bg-sub)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
        <Icon size={24} />
      </div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h2>
    </div>
    {children}
  </motion.div>
);

const Input = ({ label, icon: Icon, required, ...props }) => (
  <div style={{ flex: 1 }}>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
      {label} {required && <span style={{ color: 'var(--primary)' }}>*</span>}
    </label>
    <div style={{ position: 'relative' }}>
      {Icon && <Icon style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />}
      <input 
        {...props}
        required={required}
        style={{ 
          width: '100%', 
          padding: `14px ${Icon ? '14px 14px 44px' : '16px'}`,
          paddingLeft: Icon ? '44px' : '16px',
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border)', 
          fontSize: '15px',
          outline: 'none',
          transition: 'all 0.2s ease',
          background: 'var(--bg-sub)'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--primary)';
          e.target.style.background = '#fff';
          e.target.style.boxShadow = '0 0 0 4px rgba(255, 59, 48, 0.05)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)';
          e.target.style.background = 'var(--bg-sub)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  </div>
);

const FileInput = ({ label, name, onChange, required, fileName }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{label} {required && <span style={{ color: 'var(--primary)' }}>*</span>}</label>
    <div 
      onClick={() => document.getElementById(name).click()}
      className="card-minimal"
      style={{ 
        padding: '24px 16px', 
        border: fileName ? '2px solid #10B98130' : '2px dashed var(--border)', 
        borderRadius: 'var(--radius-md)', 
        textAlign: 'center', 
        cursor: 'pointer', 
        background: fileName ? '#F0FDF4' : 'var(--bg-sub)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '50%', 
        background: fileName ? '#10B98115' : '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: fileName ? '#10B981' : 'var(--text-dim)'
      }}>
        {fileName ? <CheckCircle2 size={20} /> : <Upload size={20} />}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: fileName ? '#065F46' : 'var(--text-dim)', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {fileName || 'Click to upload'}
      </div>
      {!fileName && <div style={{ fontSize: '11px', color: 'var(--text-dim)', opacity: 0.7 }}>PDF, JPG, PNG up to 5MB</div>}
      <input id={name} type="file" name={name} onChange={onChange} hidden required={required} accept=".pdf,.jpg,.jpeg,.png" />
    </div>
  </div>
);

export default SellerRegister;
