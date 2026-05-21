import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Package,
  User,
  Calendar,
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  Loader2,
  X,
  ChevronRight,
  Plus,
  Play
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      alert('Please enter the OTP code.');
      return;
    }
    setVerifyingOtp(true);
    try {
      const response = await api.post(`orders/${selectedOrder.id}/verify_delivery_otp/`, { otp_code: otpCode });
      alert(response.data?.status || 'Delivery verified successfully!');
      setOtpCode('');
      fetchOrders();
      // Update local state to reflect the closed status
      setSelectedOrder(prev => ({ ...prev, status: 'CLOSED' }));
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to verify OTP. Please check the code and try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('orders/');
      // Handle both paginated and non-paginated responses
      const orderData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setOrders(orderData);
      if (selectedOrder) {
        const updated = orderData.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.post(`orders/${orderId}/update_status/`, { status: newStatus });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleImageUpload = async (orderId, type, file) => {
    if (!file) return;

    // Local preview logic
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedOrder(prev => ({ ...prev, [`${type}_preview`]: reader.result }));
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append(type, file);
    // Standard PATCH request as requested
    try {
      const response = await api.patch(`orders/${orderId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedOrder(response.data);
      fetchOrders();
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status) => {
    const config = {
      'ASSIGNED': { bg: '#EFF6FF', text: '#2563EB', label: 'Order Assigned' },
      'SCHEDULED': { bg: '#F5F3FF', text: '#7C3AED', label: 'Scheduled' },
      'INSTALLATION_STARTED': { bg: '#ECFDF5', text: '#10B981', label: 'Started' },
      'IN_PROGRESS': { bg: '#FEF3C7', text: '#D97706', label: 'In Progress' },
      'CONTINUED_TOMORROW': { bg: '#FFF5F5', text: '#E53E3E', label: 'Paused - Continued Tomorrow' },
      'RESUMED': { bg: '#EBF8FF', text: '#3182CE', label: 'Resumed' },
      'COMPLETED': { bg: '#ECFDF5', text: '#10B981', label: 'Completed' },
      'AWAITING_CONFIRMATION': { bg: '#FEF3C7', text: '#D97706', label: 'Awaiting Customer' },
      'VERIFIED': { bg: '#ECFDF5', text: '#10B981', label: 'Verified' },
      'CLOSED': { bg: '#F3F4F6', text: '#6B7280', label: 'Closed Successfully' },
      
      // Legacy support
      'PENDING': { bg: '#FFFBEB', text: '#D97706', label: 'Pending' },
      'CONFIRMED': { bg: '#EFF6FF', text: '#2563EB', label: 'Confirmed' },
      'SHIPPED': { bg: '#F5F3FF', text: '#7C3AED', label: 'Shipped' },
      'OUT_FOR_DELIVERY': { bg: '#FEF3C7', text: '#D97706', label: 'Out for Delivery' },
      'DELIVERED': { bg: '#ECFDF5', text: '#10B981', label: 'Delivered' },
    };
    return config[status] || { bg: '#F3F4F6', text: '#6B7280', label: status };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" color="var(--primary)" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-1px' }}>Order Management</h1>
        <p style={{ color: 'red', fontWeight: 600 }}>Manage your service assignments and track installations.</p>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Order Details</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Payment</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Earning</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              const paymentStatus = order.payment_details?.status || 'PENDING';
              return (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>#{order.id}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
                      {order.items?.length || 0} Products
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                      <User size={16} />
                      {order.customer_name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>{order.customer_phone}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                      <Calendar size={16} />
                      {order.delivery_date || 'TBD'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>{order.delivery_time}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                      {order.payment_details?.method_display || 'COD'}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: paymentStatus === 'SUCCESS' || paymentStatus === 'PAID' ? '#059669' : '#D97706',
                      marginTop: '4px'
                    }}>
                      {paymentStatus}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{(order.items?.reduce((sum, item) => sum + parseFloat(item.seller_earning || 0), 0) || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                      Net Payout
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{
                      padding: '6px 14px',
                      background: statusStyle.bg,
                      color: statusStyle.text,
                      borderRadius: '30px',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                      {statusStyle.label}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        padding: '8px 16px',
                        background: '#000',
                        color: '#fff',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      Manage
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Management Modal */}
      {selectedOrder && (() => {
        const StatusBadge = ({ status }) => {
          const s = getStatusColor(status);
          return (
            <span style={{
              padding: '6px 14px',
              background: s.bg,
              color: s.text,
              borderRadius: '30px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
              {s.label}
            </span>
          );
        };

        const getButtonColor = (variant) => {
          switch (variant) {
            case 'primary': return { bg: 'var(--primary)', text: '#fff' };
            case 'success': return { bg: '#10B981', text: '#fff' };
            case 'warning': return { bg: '#F59E0B', text: '#fff' };
            case 'info': return { bg: '#3B82F6', text: '#fff' };
            default: return { bg: 'var(--text-main)', text: '#fff' };
          }
        };

        const getNextActions = (status) => {
          switch (status) {
            case 'ASSIGNED':
              return [
                { status: 'SCHEDULED', label: 'Schedule Installation', variant: 'primary', icon: Calendar }
              ];
            case 'SCHEDULED':
              return [
                { status: 'INSTALLATION_STARTED', label: 'Start Installation', variant: 'primary', icon: Play }
              ];
            case 'INSTALLATION_STARTED':
              return [
                { status: 'IN_PROGRESS', label: 'Begin Installation Work', variant: 'primary', icon: Loader2 }
              ];
            case 'IN_PROGRESS':
              return [
                { status: 'CONTINUED_TOMORROW', label: 'Continue Tomorrow', variant: 'warning', icon: Clock },
                { status: 'COMPLETED', label: 'Complete Installation', variant: 'success', icon: CheckCircle2, requirePhotos: true }
              ];
            case 'CONTINUED_TOMORROW':
              return [
                { status: 'RESUMED', label: 'Resume Installation', variant: 'primary', icon: Play }
              ];
            case 'RESUMED':
              return [
                { status: 'CONTINUED_TOMORROW', label: 'Continue Tomorrow', variant: 'warning', icon: Clock },
                { status: 'COMPLETED', label: 'Complete Installation', variant: 'success', icon: CheckCircle2, requirePhotos: true }
              ];
            case 'COMPLETED':
              return [
                { status: 'AWAITING_CONFIRMATION', label: 'Request Customer Confirmation', variant: 'info', icon: ChevronRight }
              ];
            default:
              return [];
          }
        };

        const nextActions = getNextActions(selectedOrder.status);

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <div className="animate-fade-in" style={{
              width: '95%',
              maxWidth: '1200px',
              maxHeight: '90vh',
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
              {/* Modal Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Manage Order #{selectedOrder.id}</h3>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600, marginTop: '4px' }}>Real-time service updates and tracking timeline.</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                  
                  {/* Column 1: Logistics & Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Location & Customer Info */}
                    <div style={{ background: 'var(--bg-sub)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <h5 style={{ fontWeight: 800, fontSize: '12px', marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>Location & Logistics</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.5 }}>{selectedOrder.shipping_address}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <User size={18} color="var(--text-dim)" style={{ flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>{selectedOrder.customer_name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>{selectedOrder.customer_phone}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Update Workflow Progress</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedOrder.status === 'COMPLETED' && (
                          <div style={{ padding: '20px', background: '#EFF6FF', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1E40AF', marginBottom: '8px' }}>Deliver Order (OTP Verification)</h4>
                            <p style={{ fontSize: '12px', color: '#1E3A8A', marginBottom: '16px' }}>Enter the 6-digit OTP code sent to the customer's phone number to verify and close the order.</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input
                                type="text"
                                placeholder="Enter OTP Code"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '10px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid #93C5FD',
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  textAlign: 'center',
                                  letterSpacing: '2px'
                                }}
                              />
                              <button
                                onClick={handleVerifyOtp}
                                disabled={verifyingOtp}
                                style={{
                                  padding: '10px 20px',
                                  background: '#2563EB',
                                  color: '#fff',
                                  borderRadius: 'var(--radius-sm)',
                                  fontWeight: 700,
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                {verifyingOtp ? 'Verifying...' : 'Verify & Deliver'}
                              </button>
                            </div>
                            {(selectedOrder.delivery_otp || lastGeneratedOtp) && (
                              <div style={{ marginTop: '12px', fontSize: '12px', color: '#1E40AF', fontWeight: 600 }}>
                                Demo/Test OTP Code: <code style={{ background: '#DBEAFE', padding: '2px 6px', borderRadius: '4px' }}>{selectedOrder.delivery_otp || lastGeneratedOtp}</code>
                              </div>
                            )}
                          </div>
                        )}
                        {nextActions.length === 0 ? (
                          selectedOrder.status !== 'COMPLETED' && (
                            <div style={{ padding: '16px', background: '#ECFDF5', color: '#059669', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0', fontWeight: 700, fontSize: '14px', textAlign: 'center' }}>
                              {selectedOrder.status === 'CLOSED' ? 'Order closed and verified.' : 'All updates completed. Awaiting admin review.'}
                            </div>
                          )
                        ) : (
                          nextActions.map((act) => {
                            const IconComponent = act.icon;
                            const isPhotoRequiredAndMissing = act.requirePhotos && (!selectedOrder.before_image || !selectedOrder.after_image);
                            
                            return (
                              <div key={act.status} style={{ width: '100%' }}>
                                <button
                                  onClick={() => updateStatus(selectedOrder.id, act.status)}
                                  disabled={isPhotoRequiredAndMissing || uploading}
                                  style={{
                                    width: '100%',
                                    padding: '14px 20px',
                                    background: isPhotoRequiredAndMissing ? 'var(--bg-sub)' : getButtonColor(act.variant).bg,
                                    color: isPhotoRequiredAndMissing ? 'var(--text-dim)' : getButtonColor(act.variant).text,
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 800,
                                    cursor: isPhotoRequiredAndMissing ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    border: '1px solid var(--border)',
                                    transition: 'all 0.2s',
                                    boxShadow: isPhotoRequiredAndMissing ? 'none' : '0 4px 6px rgba(0,0,0,0.05)'
                                  }}
                                >
                                  <IconComponent size={18} />
                                  {act.label}
                                </button>
                                {isPhotoRequiredAndMissing && (
                                  <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600, display: 'block', marginTop: '6px', textAlign: 'center' }}>
                                    * Before & After photos are required to complete this action.
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Photo Evidence */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.05em' }}>Visual Documentation</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                      {/* Before Image */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>1. Initial Setup (Before)</div>
                        <label className="upload-box" style={{ height: '170px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageUpload(selectedOrder.id, 'before_image', e.target.files[0])}
                          />
                          {(selectedOrder.before_image_preview || selectedOrder.before_image) ? (
                            <img src={selectedOrder.before_image_preview || selectedOrder.before_image} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className="upload-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
                              <Camera size={26} />
                              <span style={{ fontSize: '12px', fontWeight: 700 }}>Capture Site Setup</span>
                            </div>
                          )}
                          {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>}
                        </label>
                      </div>

                      {/* After Image */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>2. Finished Work (After)</div>
                        <label className="upload-box" style={{ height: '170px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageUpload(selectedOrder.id, 'after_image', e.target.files[0])}
                          />
                          {(selectedOrder.after_image_preview || selectedOrder.after_image) ? (
                            <img src={selectedOrder.after_image_preview || selectedOrder.after_image} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className="upload-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
                              <Camera size={26} />
                              <span style={{ fontSize: '12px', fontWeight: 700 }}>Capture Result</span>
                            </div>
                          )}
                          {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Live Progress Tracking Timeline */}
                  <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.05em' }}>Tracking History Timeline</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', maxHeight: '380px', overflowY: 'auto', paddingRight: '8px' }}>
                      {(!selectedOrder.tracking_history || selectedOrder.tracking_history.length === 0) ? (
                        <div style={{ color: 'var(--text-dim)', fontSize: '13px', fontStyle: 'italic', padding: '12px' }}>
                          No tracking timeline logs available yet.
                        </div>
                      ) : (
                        <div style={{ position: 'relative', borderLeft: '2px solid var(--border)', marginLeft: '12px', paddingLeft: '20px' }}>
                          {selectedOrder.tracking_history.map((log, index) => {
                            const c = getStatusColor(log.status);
                            return (
                              <div key={log.id || index} style={{ position: 'relative', marginBottom: '24px' }}>
                                {/* Timeline Node Pin */}
                                <div style={{
                                  position: 'absolute',
                                  left: '-29px',
                                  top: '4px',
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: '#fff',
                                  border: `3px solid ${c.text}`,
                                  boxShadow: '0 0 0 4px #fff'
                                }}></div>
                                <div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#111827' }}>
                                      {log.status_display || c.label}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                                      {new Date(log.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  {log.notes && (
                                    <p style={{
                                      fontSize: '12px',
                                      color: 'var(--text-dim)',
                                      marginTop: '6px',
                                      background: '#F9FAFB',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid var(--border)',
                                      lineHeight: 1.4
                                    }}>
                                      {log.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '20px 32px', background: '#F9FAFB', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{ padding: '12px 28px', background: 'var(--text-main)', color: '#fff', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Exit Management
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Orders;
