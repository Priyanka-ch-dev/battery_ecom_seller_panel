import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Camera,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  Play,
  Loader2,
  Calendar,
  AlertCircle,
  X,
  ChevronRight,
  Package
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    'ASSIGNED': { bg: 'var(--bg-sub)', text: 'var(--text-dim)', label: 'Assigned' },
    'IN_PROGRESS': { bg: 'var(--bg-sub)', text: 'var(--primary)', label: 'On Location' },
    'COMPLETED': { bg: 'var(--bg-sub)', text: '#10B981', label: 'Verified' },
    'DELIVERED': { bg: 'var(--bg-sub)', text: '#10B981', label: 'Finished' },
  };
  const s = config[status] || { bg: '#F9FAFB', text: '#94A3B8', label: status };
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

const Installations = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get('orders/');
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setTasks(data);
      // Update selected task if it's currently open
      if (selectedTask) {
        const updated = data.find(t => t.id === selectedTask.id);
        if (updated) setSelectedTask(updated);
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.patch(`orders/${taskId}/`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  const handleImageUpload = async (taskId, type, file) => {
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedTask(prev => ({ ...prev, [`${type}_preview`]: reader.result }));
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await api.patch(`orders/${taskId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedTask(response.data);
      fetchTasks();
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
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
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-1px' }}>Field Installations</h1>
        <p style={{ color: 'red', fontWeight: 600 }}>Execute and document your assigned service visits.</p>
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
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Task ID</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Schedule</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>#{task.id}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', fontWeight: 600 }}>Assignment</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                    <User size={16} />
                    {task.customer_name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>{task.customer_phone}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                    <Calendar size={16} />
                    {task.delivery_date}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>at {task.delivery_time}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <StatusBadge status={task.status} />
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedTask(task)}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--text-main)',
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
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)', fontWeight: 600 }}>
                  No active tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Task Management Modal */}
      {selectedTask && (
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
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Installation Task #{selectedTask.id}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600 }}>Execute service and document evidence.</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--text-dim)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                {/* Left Side: Service Details & Status */}
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Service Actions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedTask.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedTask.id, 'IN_PROGRESS')}
                          style={{
                            width: '100%',
                            padding: '16px',
                            background: 'var(--primary)',
                            color: '#fff',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                          }}
                        >
                          <Play size={18} fill="currentColor" />
                          Check In at Location
                        </button>
                      )}
                      
                      {selectedTask.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedTask.id, 'COMPLETED')}
                          disabled={!selectedTask.before_image || !selectedTask.after_image}
                          style={{
                            width: '100%',
                            padding: '16px',
                            background: (!selectedTask.before_image || !selectedTask.after_image) ? 'var(--bg-sub)' : '#10B981',
                            color: (!selectedTask.before_image || !selectedTask.after_image) ? 'var(--text-dim)' : '#fff',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 800,
                            cursor: (!selectedTask.before_image || !selectedTask.after_image) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <CheckCircle2 size={18} />
                          Complete Installation
                        </button>
                      )}

                      {selectedTask.status === 'COMPLETED' && (
                        <div style={{
                          padding: '16px',
                          background: 'var(--bg-sub)',
                          color: '#10B981',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 800,
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          border: '1px solid var(--border)'
                        }}>
                          <CheckCircle2 size={18} />
                          Service Verified
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-sub)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <h5 style={{ fontWeight: 800, fontSize: '14px', marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Location & Logistics</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.5 }}>{selectedTask.shipping_address}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <User size={18} color="var(--text-dim)" style={{ flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{selectedTask.customer_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>{selectedTask.customer_phone}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Photo Evidence */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.05em' }}>Visual Documentation</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    {/* Before Image */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>1. Initial Setup (Before)</div>
                      <label className="upload-box" style={{ height: '180px' }}>
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleImageUpload(selectedTask.id, 'before_image', e.target.files[0])}
                        />
                        {(selectedTask.before_image_preview || selectedTask.before_image) ? (
                          <img src={selectedTask.before_image_preview || selectedTask.before_image} alt="Before" />
                        ) : (
                          <div className="upload-label">
                            <Camera size={26} />
                            <span>Capture Site Setup</span>
                          </div>
                        )}
                        {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>}
                      </label>
                    </div>

                    {/* After Image */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>2. Finished Work (After)</div>
                      <label className="upload-box" style={{ height: '180px' }}>
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleImageUpload(selectedTask.id, 'after_image', e.target.files[0])}
                        />
                        {(selectedTask.after_image_preview || selectedTask.after_image) ? (
                          <img src={selectedTask.after_image_preview || selectedTask.after_image} alt="After" />
                        ) : (
                          <div className="upload-label">
                            <Camera size={26} />
                            <span>Capture Result</span>
                          </div>
                        )}
                        {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>}
                      </label>
                    </div>
                  </div>
                  
                  {selectedTask.status === 'IN_PROGRESS' && (!selectedTask.before_image || !selectedTask.after_image) && (
                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dim)', background: 'var(--bg-sub)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 600 }}>
                      <AlertCircle size={14} color="var(--primary)" />
                      Photos required to finalize task.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 32px', background: '#F9FAFB', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedTask(null)}
                style={{ padding: '12px 28px', background: 'var(--text-main)', color: '#fff', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
              >
                Exit Management
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Installations;
