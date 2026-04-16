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
  Plus
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('orders/');
      // Handle both paginated and non-paginated responses
      const orderData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setOrders(orderData);
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
    switch (status) {
      case 'PENDING': return { bg: '#FFFBEB', text: '#D97706', label: 'Pending' };
      case 'IN_PROGRESS': return { bg: '#EFF6FF', text: '#2563EB', label: 'In Progress' };
      case 'COMPLETED': return { bg: '#ECFDF5', text: '#059669', label: 'Completed' };
      case 'SHIPPED': return { bg: '#F5F3FF', text: '#7C3AED', label: 'Shipped' };
      case 'DELIVERED': return { bg: '#ECFDF5', text: '#059669', label: 'Delivered' };
      default: return { bg: '#F3F4F6', text: '#6B7280', label: status };
    }
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
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.status);
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
      {selectedOrder && (
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
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Manage Order #{selectedOrder.id}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600 }}>Updating installation status and proof.</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ width: '40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--text-dim)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                {/* Left Side: Info & Status */}
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '16px' }}>Status Transition</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button
                        onClick={() => updateStatus(selectedOrder.id, 'IN_PROGRESS')}
                        disabled={selectedOrder.status === 'IN_PROGRESS' || selectedOrder.status === 'COMPLETED'}
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          border: '2px solid #007AFF',
                          color: selectedOrder.status === 'IN_PROGRESS' ? '#fff' : '#007AFF',
                          background: selectedOrder.status === 'IN_PROGRESS' ? '#007AFF' : 'transparent',
                          fontWeight: 800,
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          opacity: selectedOrder.status === 'COMPLETED' ? 0.5 : 1
                        }}
                      >
                        1. Start Installation
                        {selectedOrder.status === 'IN_PROGRESS' && <CheckCircle2 size={18} />}
                      </button>
                      <button
                        onClick={() => updateStatus(selectedOrder.id, 'COMPLETED')}
                        disabled={selectedOrder.status !== 'IN_PROGRESS'}
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          border: '2px solid #34C759',
                          color: selectedOrder.status === 'COMPLETED' ? '#fff' : '#34C759',
                          background: selectedOrder.status === 'COMPLETED' ? '#34C759' : 'transparent',
                          fontWeight: 800,
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        2. Mark as Completed
                        {selectedOrder.status === 'COMPLETED' && <CheckCircle2 size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ background: '#F9FAFB', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                    <h5 style={{ fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>Customer & Location</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
                        <MapPin size={16} color="var(--text-dim)" />
                        <span style={{ fontWeight: 600 }}>{selectedOrder.shipping_address}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
                        <Package size={16} color="var(--text-dim)" />
                        <span style={{ fontWeight: 600 }}>Items: {selectedOrder.items?.map(i => `${i.quantity}x ${i.product_detail?.name}`).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Image Uploads */}
                <div style={{ background: '#fff' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '20px' }}>Installation Evidence</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    {/* Before Image */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>1. INITIAL SETUP (BEFORE)</div>
                      <label className="upload-box">
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleImageUpload(selectedOrder.id, 'before_image', e.target.files[0])}
                        />
                        {(selectedOrder.before_image_preview || selectedOrder.before_image) ? (
                          <img src={selectedOrder.before_image_preview || selectedOrder.before_image} alt="Before" />
                        ) : (
                          <div className="upload-label">
                            <Camera size={28} />
                            <span>Capture Initial Setup</span>
                          </div>
                        )}
                        {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>}
                      </label>
                    </div>

                    {/* After Image */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>2. COMPLETED WORK (AFTER)</div>
                      <label className="upload-box">
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleImageUpload(selectedOrder.id, 'after_image', e.target.files[0])}
                        />
                        {(selectedOrder.after_image_preview || selectedOrder.after_image) ? (
                          <img src={selectedOrder.after_image_preview || selectedOrder.after_image} alt="After" />
                        ) : (
                          <div className="upload-label">
                            <Camera size={28} />
                            <span>Capture Finished Result</span>
                          </div>
                        )}
                        {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>}
                      </label>
                    </div>
                  </div>
                  <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-sub)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, lineHeight: 1.6 }}>
                      <strong>Note:</strong> Photos are required for quality assurance. Ensure the battery and connections are clearly visible.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 32px', background: '#F9FAFB', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '12px 24px', background: '#000', color: '#fff', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
