import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Trash, ShoppingCart, UserCircle2, Package } from 'lucide-react';

// Confirmation modal component (Styled for consistency)
const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl text-center">
        <p className="mb-6 text-gray-200 text-lg font-medium">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            autoFocus
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get('http://localhost:8080/api/v1/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.success) {
          setCartItems(res.data.cart || []);
        } else {
          setError(res.data.message || 'Failed to load cart data.');
          setCartItems([]);
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
        const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
        setError(errorMessage);
        if (err.response?.status === 401) {
            alert("Session expired or invalid. Please log in again.");
            localStorage.removeItem('authToken');
            navigate('/login');
        }
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleDeleteConfirmation = (itemId) => {
    setDeleteId(itemId);
    setIsModalOpen(true);
  };

  const deleteItemFromCart = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:8080/api/v1/cart/delete',
        { productId: deleteId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      if (response.data && response.data.success) {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== deleteId));
        // Using a more subtle notification, or you can use a toast library
        // alert(response.data.message || "Item removed successfully.");
        console.log(response.data.message || "Item removed successfully.");
      } else {
        setError(response.data.message || "Failed to delete item from cart.");
      }
    } catch (err) {
      console.error('Failed to delete item from cart:', err);
      setError(err.response?.data?.message || 'Error deleting item.');
       if (err.response?.status === 401) {
            alert("Session expired or invalid. Please log in again.");
            localStorage.removeItem('authToken');
            navigate('/login');
        }
    } finally {
      setIsModalOpen(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setDeleteId(null);
  };

  const handleBuyNowClick = (itemId, e) => {
    e.stopPropagation();
    // navigate(`/paymentgateway?id=${itemId}`); // Or your actual checkout route
    alert(`Proceeding to buy item: ${itemId}. (Implement checkout flow)`);
  };
  
  const handleItemCardClick = (itemId) => {
    // Optional: Navigate to product detail page
    // navigate(`/dashboard/product/${itemId}`); 
    console.log("Clicked item card for product ID:", itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center">
            <ShoppingCart className="w-16 h-16 text-indigo-400 animate-bounce mb-4" />
            <p className="text-white text-2xl font-semibold">Loading Your Cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center py-10 px-4">
      {/* Top Bar consistent with AddProduct.jsx */}
      <div className="w-full max-w-6xl flex items-center justify-between p-4 sm:p-6 mb-6 sm:mb-8 bg-gray-800/50 backdrop-blur-md border-b border-gray-700 rounded-t-xl">
        <Link to="/dashboard" aria-label="Go to Dashboard">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 sm:h-12 w-auto transition-transform hover:scale-110"
            loading="lazy"
          />
        </Link>
        <div className="flex items-center gap-3">
          {/* Profile button style from AddProduct.jsx */}
          <button
            onClick={() => navigate('/dashboard/profile')}
            aria-label="Go to profile"
            className="w-10 h-10 flex items-center justify-center bg-gray-700/80 rounded-md hover:bg-gray-600/80 border border-white/20 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <UserCircle2 className="w-6 h-6 text-gray-300" />
          </button>
        </div>
      </div>
      
      {/* Main Cart Content Box */}
      <div className="w-full max-w-4xl bg-gray-800/70 backdrop-blur-xl border border-gray-700/80 rounded-xl shadow-2xl p-6 sm:p-10 flex flex-col">
        <h1 className="text-white text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-center tracking-wide">
          Your Shopping Cart
          <ShoppingCart className="inline-block w-8 h-8 sm:w-9 sm:h-9 ml-3 text-indigo-400" />
        </h1>

        {error && (
          <div className="bg-red-700/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 text-center">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        <section className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6 max-h-[55vh] overflow-y-auto shadow-inner custom-scrollbar">
          {cartItems.length === 0 && !loading ? (
            <div className="text-gray-300 text-center text-lg py-10 sm:py-16 select-none">
                <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="mb-6 text-xl">Your cart is empty.</p>
              <Link
                to="/dashboard"
                className="inline-block px-8 py-3 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800 hover:bg-gray-700/70 transition-all duration-300 shadow-lg hover:shadow-indigo-500/20"
                // onClick={() => handleItemCardClick(item.id)} // Keep if you want card click action
                // role="button"
                // tabIndex={0}
                // onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleItemCardClick(item.id); }}
                aria-label={`Cart item: ${item.name}`}
              >
                <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0 sm:mr-4">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md mr-4 border-2 border-gray-700 shadow-md" />
                    ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-md mr-4 flex items-center justify-center border-2 border-gray-600 shadow-md">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-indigo-400 font-semibold text-lg sm:text-xl line-clamp-1">
                            {item.name || 'Unnamed Product'}
                        </h3>
                        <p className="text-white font-medium text-md sm:text-lg">
                            ₹{item.price?.toLocaleString() || 'N/A'}
                        </p>
                         <p className="text-gray-400 text-sm mt-1">
                            Seller: {item.seller_name || 'Unknown'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-end sm:justify-start shrink-0 mt-3 sm:mt-0">
                  <button
                    className="px-5 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    onClick={(e) => handleBuyNowClick(item.id, e)}
                    aria-label={`Buy now ${item.name}`}
                  >
                    Buy Now
                  </button>
                  <button
                    className="p-2.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white flex items-center justify-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    aria-label={`Delete ${item.name} from cart`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConfirmation(item.id);
                    }}
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <ConfirmationModal
          isOpen={isModalOpen}
          onConfirm={deleteItemFromCart}
          onCancel={handleCancelDelete}
          message="Are you sure you want to remove this item from your cart?"
        />
      </div>
    </div>
  );
};

export default Cart;