import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('CUSTOMER');
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
    bank_passbook_copy: null,
    shop_image: null,
    owner_image: null
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
      // Append basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      data.append('role', role);

      // Append files only for sellers
      if (role === 'SELLER') {
        Object.entries(files).forEach(([key, value]) => {
          if (value) data.append(key, value);
        });
      }

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
        const firstError = Object.entries(errorData)[0];
        setError(`${firstError[0]}: ${firstError[1]}`);
      } else {
        setError('Registration failed. Please check your input.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '20px' }}>
        <div className="animate-fade-in card-minimal" style={{ textAlign: 'center', maxWidth: '400px', width: '100%', padding: '40px' }}>
          <div style={{ width: '64px', height: '64px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 color="#10B981" size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Registration Successful!</h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>
            {role === 'SELLER' 
              ? 'Your account has been created and is pending admin approval. You will be redirected to login shortly.' 
              : 'Your account has been created successfully. Redirecting you to login...'}
          </p>
          <Loader2 className="animate-spin" size={24} color="var(--primary)" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '40px 20px' }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: role === 'SELLER' ? '900px' : '500px', padding: '40px', background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>Join the battery_ecom ecosystem as a Customer or Seller.</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-sub)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px' }}>
          <button 
            type="button"
            onClick={() => setRole('CUSTOMER')}
            style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: 'none', background: role === 'CUSTOMER' ? '#fff' : 'transparent', color: role === 'CUSTOMER' ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: role === 'CUSTOMER' ? 'var(--shadow-sm)' : 'none' }}
          >
            Customer
          </button>
          <button 
            type="button"
            onClick={() => setRole('SELLER')}
            style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: 'none', background: role === 'SELLER' ? '#fff' : 'transparent', color: role === 'SELLER' ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: role === 'SELLER' ? 'var(--shadow-sm)' : 'none' }}
          >
            Seller
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #EF444430', color: '#B91C1C', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: role === 'SELLER' ? '1fr 1fr' : '1fr', gap: '40px' }}>
            
            {/* Basic Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <User size={18} color="var(--primary)" /> Basic Information
               </h3>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
                  <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
               </div>

               <Input label="Username" name="username" value={formData.username} onChange={handleInputChange} icon={User} required />
               <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} icon={Mail} required />
               <Input label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} icon={Lock} required />
               <Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} icon={Phone} required />
               
               {role === 'CUSTOMER' && (
                  <Input label="Business Name (Optional)" name="business_name" value={formData.business_name} onChange={handleInputChange} icon={Building2} />
               )}
            </div>

            {/* Seller Specific Info */}
            {role === 'SELLER' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Building2 size={18} color="var(--primary)" /> Business & Legal Info
                 </h3>
                 
                 <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleInputChange} icon={Building2} required />
                 <Input label="GST Number" name="gst_number" value={formData.gst_number} onChange={handleInputChange} icon={FileText} required />
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input label="PAN Number" name="pan_number" value={formData.pan_number} onChange={handleInputChange} required />
                    <Input label="Aadhaar Number" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} required />
                 </div>

                 <Input label="Shop License No." name="shop_license_number" value={formData.shop_license_number} onChange={handleInputChange} required />
                 
                 <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                    <CreditCard size={18} color="var(--primary)" /> Banking Details
                 </h3>
                 
                 <Input label="Account Holder Name" name="bank_account_name" value={formData.bank_account_name} onChange={handleInputChange} required />
                 <Input label="Bank Name" name="bank_name" value={formData.bank_name} onChange={handleInputChange} required />
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                    <Input label="Account Number" name="bank_account_number" value={formData.bank_account_number} onChange={handleInputChange} required />
                    <Input label="IFSC Code" name="bank_ifsc" value={formData.bank_ifsc} onChange={handleInputChange} required />
                 </div>

                 <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '-12px', color: 'var(--text-main)' }}>Business Address</label>
                 <textarea 
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '14px', minHeight: '80px', fontFamily: 'inherit' }}
                 />
              </div>
            )}
          </div>

          {/* Seller Documents */}
          {role === 'SELLER' && (
            <div style={{ marginTop: '40px', padding: '32px', background: 'var(--bg-sub)', borderRadius: 'var(--radius-lg)' }}>
               <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Upload size={18} color="var(--primary)" /> Document Uploads
               </h3>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <FileInput label="PAN Card Copy" name="pan_card_copy" onChange={handleFileChange} required fileName={files.pan_card_copy?.name} />
                  <FileInput label="Aadhaar Card Copy" name="aadhaar_card_copy" onChange={handleFileChange} required fileName={files.aadhaar_card_copy?.name} />
                  <FileInput label="Shop License Copy" name="shop_license_copy" onChange={handleFileChange} required fileName={files.shop_license_copy?.name} />
                  <FileInput label="Bank Passbook Copy" name="bank_passbook_copy" onChange={handleFileChange} required fileName={files.bank_passbook_copy?.name} />
                  <FileInput label="Shop Image" name="shop_image" onChange={handleFileChange} required fileName={files.shop_image?.name} />
                  <FileInput label="Owner Image" name="owner_image" onChange={handleFileChange} required fileName={files.owner_image?.name} />
               </div>
            </div>
          )}

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <button 
              type="submit" 
              disabled={loading}
              className="glow-btn"
              style={{ padding: '16px 64px', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
           <p style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 600 }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 800 }}>Sign In</Link>
           </p>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, icon: Icon, required, ...props }) => (
  <div style={{ flex: 1 }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
      {label} {required && <span style={{ color: '#E03126' }}>*</span>}
    </label>
    <div style={{ position: 'relative' }}>
      {Icon && <Icon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={16} />}
      <input 
        {...props}
        required={required}
        style={{ 
          width: '100%', 
          padding: `12px ${Icon ? '12px 12px 38px' : '16px'}`,
          paddingLeft: Icon ? '38px' : '16px',
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--border)', 
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  </div>
);

const FileInput = ({ label, name, onChange, required, fileName }) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dim)' }}>{label}</label>
    <div 
      onClick={() => document.getElementById(name).click()}
      style={{ padding: '12px', background: '#fff', border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
    >
      <Upload size={20} color="var(--text-dim)" style={{ marginBottom: '4px' }} />
      <div style={{ fontSize: '11px', fontWeight: 700, color: fileName ? 'var(--primary)' : 'var(--text-dim)' }}>
        {fileName || 'Choose File'}
      </div>
      <input id={name} type="file" name={name} onChange={onChange} hidden required={required} />
    </div>
  </div>
);

export default Register;
