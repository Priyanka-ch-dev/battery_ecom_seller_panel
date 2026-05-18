import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Installations from './pages/Installations';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Register from './pages/Register';
import SellerRegister from './pages/SellerRegister';
import Invoices from './pages/Invoices';



const ProtectedRoute = ({ children }) => {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'SELLER') {
    return <Navigate to="/login" replace />;
  }

  if (user?.status !== 'APPROVED') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/seller/register" element={<SellerRegister />} />
          <Route path="/login" element={<Login />} />


          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="installations" element={<Installations />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
