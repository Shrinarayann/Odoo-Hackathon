import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-gray-900/80 to-gray-900/90 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-600/30 rounded-full filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/30 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;