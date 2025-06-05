import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash, ShoppingCart, UserCircle2 } from 'lucide-react';

// Initial cart data
const initialCartItems = [
  { id: 1, name: 'Product 1', price: 1000 },
  { id: 2, name: 'Product 2', price: 2000 },
  { id: 3, name: 'Product 3', price: 1500 },
  { id: 4, name: 'Product 4', price: 3000 },
];

// Confirmation modal component
const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg text-center">
        <p className="mb-6 text-gray-800 font-semibold">{message}</p>
        <div className="flex justify-center space-x-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            autoFocus
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Handler to open confirmation modal before deleting
  const confirmDelete = (itemId) => {
    setDeleteId(itemId);
    setIsModalOpen(true);
  };

  // Delete item after confirmation
  const deleteFromCart = () => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== deleteId));
    setIsModalOpen(false);
    setDeleteId(null);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setIsModalOpen(false);
    setDeleteId(null);
  };

  // Navigate to payment gateway for buying
  const handleItemClick = (itemId) => {
    navigate(`/paymentgateway?id=${itemId}`);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900 px-4"
      style={{
        backgroundImage: `url('/background.jpg')`,
        backgroundBlendMode: 'overlay',
      }}
    >
      <div className="w-full max-w-4xl min-h-[80vh] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between mb-10">
          <Link to="/dashboard" aria-label="Go to Dashboard">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-20 w-auto transition-transform hover:scale-110"
              loading="lazy"
            />
          </Link>
          <button
            onClick={() => navigate('/dashboard/profile')}
            aria-label="Go to profile"
            className="w-12 h-12 flex items-center justify-center bg-[#23293a] rounded-lg hover:bg-[#2a3142] border border-white/30 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <UserCircle2 className="w-7 h-7 text-gray-300" />
          </button>
        </header>

        {/* Cart Title */}
        <h1 className="text-white text-4xl font-extrabold mb-8 text-center tracking-wide drop-shadow-lg">
          Your Cart <ShoppingCart className="inline-block w-9 h-9 ml-2 text-indigo-400 animate-pulse" />
        </h1>

        {/* Cart Items */}
        <section className="flex-1 bg-white/20 border border-white/30 rounded-2xl p-6 max-h-[520px] overflow-y-auto shadow-inner w-full">
          {cartItems.length === 0 ? (
            <div className="text-white text-center text-lg py-20 select-none">
              <p className="mb-4">Your cart is empty.</p>
              <Link
                to="/dashboard"
                className="inline-block px-6 py-3 bg-indigo-600 rounded-full text-white font-semibold hover:bg-indigo-700 transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border border-white/20 rounded-xl p-4 mb-4 bg-gradient-to-r from-indigo-700/30 to-indigo-900/40 hover:from-indigo-600/50 hover:to-indigo-800/60 cursor-pointer transition-shadow shadow-indigo-500/30"
                onClick={() => handleItemClick(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleItemClick(item.id);
                }}
                aria-label={`Buy ${item.name} for ₹${item.price}`}
              >
                <div className="flex flex-col">
                  <span className="text-indigo-300 font-bold text-xl tracking-wide">{item.name}</span>
                  <span className="text-indigo-200 font-mono text-lg">₹ {item.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    className="px-6 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item.id);
                    }}
                    aria-label={`Buy now ${item.name}`}
                  >
                    Buy Now
                  </button>
                  <button
                    className="p-3 rounded-lg hover:bg-red-700 transition text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Delete ${item.name} from cart`}
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(item.id);
                    }}
                  >
                    <Trash className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={isModalOpen}
          onConfirm={deleteFromCart}
          onCancel={cancelDelete}
          message="Are you sure you want to remove this item from your cart?"
        />
      </div>
    </div>
  );
};

export default Cart;