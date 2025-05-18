import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthLayout from './components/auth/AuthLayout';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import Dashboard from './components/dashboard/Dashboard';
import Cart from './components/dashboard/Cart'; // adjust path if needed
import Profile from './components/dashboard/Profile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthLayout><LoginForm /></AuthLayout>} />
        <Route path="/signup" element={<AuthLayout><SignUpForm /></AuthLayout>} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/cart" element={<Cart />} />
         <Route path="/Profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;