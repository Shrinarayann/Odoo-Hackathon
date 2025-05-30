import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthLayout from './components/auth/AuthLayout';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import Dashboard from './components/dashboard/Dashboard';
import MyListings from './components/dashboard/MyListings';
import PreviousPurchases from './components/dashboard/PreviousPurchases';
import Profile from './components/dashboard/Profile';
import Cart from './components/dashboard/Cart';
import AddProduct from './components/dashboard/AddProduct';
import ProductsPage from './components/dashboard/ProductsPage';



function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<AuthLayout><LoginForm /></AuthLayout>} />
        <Route path="/signup" element={<AuthLayout><SignUpForm /></AuthLayout>} />

        {/* Dashboard and related routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/listings" element={<MyListings />} />
        <Route path="/dashboard/add-product" element={<AddProduct />} />
        <Route path="/dashboard/purchases" element={<PreviousPurchases />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/cart" element={<Cart />} />
        <Route path="/dashboard/products" element={<ProductsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
