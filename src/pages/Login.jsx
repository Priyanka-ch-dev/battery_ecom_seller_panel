import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle, Loader2, Phone, Lock } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1 = Request, 2 = Verify & Reset
  const [resetLoading, setResetLoading] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setResetLoading(true);
    try {
      await api.post('otp/request/', {
        phone_number: resetPhone,
        purpose: 'PASSWORD_RESET'
      });
      setSuccessMsg('OTP sent successfully to your registered mobile number.');
      setResetStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Ensure the number is registered.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setResetLoading(true);
    try {
      await api.post('users/reset-password/', {
        phone_number: resetPhone,
        otp_code: resetOtp,
        new_password: newPassword
      });
      setSuccessMsg('Password reset successfully! You can now log in.');
      setIsForgotPassword(false);
      setResetStep(1);
      setResetPhone('');
      setResetOtp('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP or failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '20px'
    }}>
      <div className="animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '400px',
        padding: '40px',
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'var(--primary)', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <KeyRound color="#fff" size={24} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Seller Portal</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Welcome back! Please enter your details.</p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px', 
            background: '#FFF5F5', 
            color: '#E03126', 
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            border: '1px solid rgba(224, 49, 38, 0.1)'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ 
            padding: '12px', 
            background: '#ECFDF5', 
            color: '#059669', 
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            border: '1px solid #A7F3D0'
          }}>
            {successMsg}
          </div>
        )}

        {isForgotPassword ? (
          resetStep === 1 ? (
            <form onSubmit={handleRequestResetOtp}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Registered Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />
                  <input 
                    type="text" 
                    required
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    placeholder="Enter phone number"
                    style={{ 
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={resetLoading}
                style={{ 
                  width: '100%',
                  padding: '14px',
                  background: 'var(--primary)',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {resetLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send OTP'}
              </button>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button type="button" onClick={() => setIsForgotPassword(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Back to Login</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Enter 6-digit OTP</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="000000"
                    style={{ 
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ 
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={resetLoading}
                style={{ 
                  width: '100%',
                  padding: '14px',
                  background: '#10B981',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {resetLoading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
              </button>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button type="button" onClick={() => setResetStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Back</button>
              </div>
            </form>
          )
        ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@example.com"
                style={{ 
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ 
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <div style={{ marginTop: '8px', textAlign: 'right' }}>
                <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '14px',
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
        )}

        <div style={{ marginTop: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 600 }}>
            Don't have an account? <Link to="/seller/register" style={{ color: 'var(--primary)', fontWeight: 800 }}>Sign up as Seller</Link>
          </p>

          {/* <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
            Are you an admin? <a href="http://localhost:5173" style={{ color: 'var(--primary)', fontWeight: 700 }}>Admin Login</a>
          </p> */}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Login;
