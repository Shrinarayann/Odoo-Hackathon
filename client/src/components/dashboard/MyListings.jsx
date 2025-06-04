import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Trash2, Search, ShoppingCart, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const MyListings = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filters, setFilters] = useState({ search: '' });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/v1/products/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.products) {
        setProducts(response.data.products);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
  };

  const filteredProducts = products.filter((product) => {
    if (!filters.search) return true;
    const term = filters.search.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term)
    );
  });

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(productId);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:8080/api/v1/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(products.filter((product) => product.id !== productId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="bg-gray-800 shadow-lg mb-4">
        <div className="w-full py-2 px-4 flex justify-between items-center">
          <Link to="/dashboard">
            <img src="/logo.png" alt="Logo" className="h-11 w-auto" />
          </Link>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64 bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button onClick={() => navigate('/dashboard/cart')} className="text-gray-400 hover:text-white">
              <ShoppingCart className="h-6 w-6" />
            </button>
            <button onClick={() => navigate('/dashboard/profile')} className="text-gray-400 hover:text-white">
              <User className="h-8 w-8" />
            </button>
          </div>
        </div>
      </header>

      <h1 className="text-3xl font-bold mb-6">My Listings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-gray-800 rounded-xl p-4 shadow relative group transition">
            <img
              src={product.image_url || 'https://via.placeholder.com/150'}
              alt={product.name}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-400">{product.category}</p>
            <p className="text-sm text-gray-400">₹{product.price}</p>
            <p className="text-sm text-gray-500 mt-2">{product.description}</p>

            <button
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
              onClick={() => handleDelete(product.id)}
              disabled={deletingId === product.id}
              title="Delete"
            >
              {deletingId === product.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyListings;
