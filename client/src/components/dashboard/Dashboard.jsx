import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, User, X, Plus, Info, Phone, Package, MonitorSmartphone, Shirt, Home, HeartPulse, BookOpen, Dumbbell, LogOut } from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Profile from './Profile';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [user, setUser] = useState({
    displayName: 'Brilliant Ostrich',
    email: 'ostrich@example.com',
    profilePicture: '',
    otherInfo: 'Member since 2023',
  });

  const navigate = useNavigate();

  const menuItems = [
    { icon: Package, label: 'My Listings', path: '/dashboard/listings' },
    { icon: Plus, label: 'Add Product', path: '/dashboard/products' },
    { icon: Info, label: 'About', path: '/dashboard/about' },
    { icon: Phone, label: 'Contact', path: '/dashboard/contact' },
  ];

  const categories = [
    { icon: MonitorSmartphone, name: 'Electronics', description: 'Smart devices, laptops, and accessories for modern living.' },
    { icon: Shirt, name: 'Clothing', description: 'Stylish wear for men, women, and kids.' },
    { icon: Home, name: 'Home', description: 'Essentials and decor for every home.' },
    { icon: HeartPulse, name: 'Health', description: 'Personal care, wellness, and fitness products.' },
    { icon: BookOpen, name: 'Books', description: 'Reading materials and office supplies.' },
    { icon: Dumbbell, name: 'Sports', description: 'Gear and tools for fitness and adventure.' },
  ];

  const handleCategoryClick = async (categoryName) => {
    try {
      console.log('Clicked category:', categoryName); // Debug log
      
      const token = localStorage.getItem('authToken');
      console.log('Token exists:', !!token); // Debug log
      
      const response = await axios.get(
        'http://localhost:8080/api/v1/products/search',
        { 
          params: { category: categoryName },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('API Response:', response); // Debug log
      console.log('Response data:', response.data); // Debug log
      console.log('Products array:', response.data?.products); // Debug log
      
      // Check if response has the expected structure
      if (response.data && response.data.success && response.data.products) {
        navigate('/dashboard/products', {
          state: { 
            category: categoryName, 
            data: response.data.products 
          },
        });
      } else {
        console.error('Unexpected response structure:', response.data);
        alert('Failed to fetch products. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching category products:', err);
      console.error('Error response:', err.response?.data); // More detailed error logging
      console.error('Error status:', err.response?.status);
      alert('Error fetching products. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-800 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 pt-20">
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg p-3 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout button at the bottom */}
        <div className="p-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 w-full text-left text-red-400 hover:text-white hover:bg-red-600 rounded-lg p-3 transition-colors"
          >
            <LogOut className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gray-800 shadow-lg fixed w-full z-50 top-0">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white">
              <Menu className="h-8 w-8" />
            </button>
            <Link to="/dashboard">
              <img src="/logo.png" alt="Logo" className="h-11 w-auto" />
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={() => navigate('/dashboard/add-product')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Plus className="h-6 w-6" />
              <span>Sell</span>
            </button>

            <button
              className="text-gray-400 hover:text-white"
              onClick={() => navigate('/dashboard/cart')}
              aria-label="Go to cart"
            >
              <ShoppingCart className="h-6 w-6" />
            </button>

            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setIsProfileOpen(true)}
              aria-label="Open profile"
            >
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Auction Banner */}
        <div
          onClick={() => navigate('/dashboard/auction')}
          className="relative rounded-xl overflow-hidden mb-8 h-64 cursor-pointer"
        >
          <img
            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
            alt="Auction Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent flex items-center p-8">
            <h1 className="text-4xl font-bold text-white">Auction</h1>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">All Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleCategoryClick(cat.name)}
              >
                <cat.icon className="h-8 w-8 text-indigo-400 mb-3" />
                <h3 className="text-lg font-medium text-white">{cat.name}</h3>
                <p className="text-gray-400 mt-2">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>

        <Outlet />
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Profile
            user={user}
            onClose={() => setIsProfileOpen(false)}
            onSave={(updatedUser) => {
              setUser(updatedUser);
              setIsProfileOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;