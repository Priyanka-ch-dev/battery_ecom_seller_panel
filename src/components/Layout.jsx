import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  LogOut,
  User,
  ChevronRight,
  ChevronLeft,
  Battery,
  Wrench,
  Menu,
  X,
  Wallet,
  FileText
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Installations', path: '/installations', icon: Wrench },
    { name: 'Wallet & Earnings', path: '/wallet', icon: Wallet },
    { name: 'Company Profile', path: '/profile', icon: User },
  ];


  return (
    <div className="layout-wrapper">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="mobile-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div style={{ padding: isCollapsed ? '32px 20px' : '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            minWidth: '40px',
            height: '40px',
            background: 'var(--primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Battery color="#fff" size={20} />
          </div>
          <span className="logo-text" style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px', overflow: 'hidden' }}>Seller Panel</span>
        </div>

        <nav style={{ padding: '0 16px', flex: 1 }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={20} style={{ minWidth: '20px' }} />
                  <span className="link-text">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={logout}
            className="logout-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: '1px solid var(--border)'
            }}
          >
            <LogOut size={20} style={{ minWidth: '20px' }} />
            <span className="link-text">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <header className="header-bar">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="menu-toggle-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <button
              className="desktop-only"
              onClick={toggleCollapse}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-dim)',
                padding: '4px',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
            >
              {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
            </button>
            <h2 className="seller-welcome" style={{ display: 'flex', alignItems: 'center', margin: 0 }}>Welcome, {user?.first_name || 'Seller'}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>{user?.username}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>Delivery Person</div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#f1f1f1',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} color="var(--text-dim)" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '40px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;


