import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { 
  Menu, 
  ShoppingCart, 
  User, 
  X, 
  Package, 
  ShoppingBag,
  Settings,
  LogOut
} from 'lucide-react';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { icon: Package, label: 'My Listings', path: '/listings' },
    { icon: ShoppingBag, label: 'Previous Purchases', path: '/purchases' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static`}
      >
        <div className="p-4">
          <button 
            onClick={toggleSidebar} 
            className="absolute right-4 top-4 text-gray-400 hover:text-white md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-3 mb-8 mt-4">
            <span className="text-lg font-semibold text-white">Logo</span>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg p-3 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button className="flex w-full items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg p-3 transition-colors">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Header */}
        <header className="bg-gray-900 shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="text-gray-400 hover:text-white md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 md:hidden">
                <span className="text-lg font-semibold">Logo</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white">
                <ShoppingCart className="h-6 w-6" />
              </button>
              <button className="text-gray-400 hover:text-white">
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;