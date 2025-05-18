import React, { useState } from 'react';
import Button from '../ui/Button'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';
import { Trash } from 'lucide-react'; // Import the trash icon

const initialCartItems = [
  { id: 1, name: 'Product 1', price: 1000 },
  { id: 2, name: 'Product 2', price: 2000 },
  { id: 3, name: 'Product 3', price: 1500 },
  { id: 4, name: 'Product 4', price: 3000 },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const navigate = useNavigate();

  const deleteFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-[400px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo as image placeholder */}
          <div className="h-8 w-20 bg-gray-300 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">Logo</span>
          </div>
          {/* Profile icon button */}
          <button
            onClick={() => navigate('/dashboard/profile')}
            aria-label="Go to profile"
            className="w-9 h-9 flex items-center justify-center bg-[#23293a] rounded-md hover:bg-[#2a3142] border border-white/30 transition"
          >
            <svg
              className="w-6 h-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 16-4 16 0" />
            </svg>
          </button>
        </div>
        {/* Cart Title (centered) */}
        <div className="text-white text-2xl font-bold mb-4 text-center">Cart</div>
        {/* Cart Items */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-4 mb-6">
          {cartItems.length === 0 ? (
            <div className="text-white text-center">Your cart is empty.</div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="mb-4 last:mb-0 flex items-center justify-between bg-transparent border border-white/20 rounded-lg p-3"
              >
                <span className="text-white">{item.name}</span>
                <span className="text-indigo-200">₹ {item.price}</span>
                <button
                  className="ml-2 p-2 rounded-md bg-red-600 hover:bg-red-700 transition text-white flex items-center"
                  aria-label="Delete item"
                  onClick={() => deleteFromCart(item.id)}
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
        {/* Total */}
        <div className="flex justify-between items-center text-white mb-6">
          <span>Total price to pay:</span>
          <span className="font-bold">Rs. {total}</span>
        </div>
        {/* Checkout Button */}
        <Button variant="primary" className="w-full text-center font-semibold">
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default Cart;
