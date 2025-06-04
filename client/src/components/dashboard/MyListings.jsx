// import React from 'react';
// import { Plus, ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import SearchBar from './SearchBar';         // Adjust path as needed
// import FilterButtons from './FilterButtons'; // Adjust path as needed
// import ProductCard from './ProductCard';     // Adjust path as needed

// const MyListings = () => {
//   const navigate = useNavigate();

//   // Example product data
//   const products = [
//     {
//       id: 1,
//       name: 'Premium Leather Jacket',
//       price: '$299.99',
//       category: 'Mink',
//       status: 'Active',
//       seller: 'YourShop',
//       image: 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
//     },
//     {
//       id: 2,
//       name: 'Speedy Tiger',
//       price: '$159.99',
//       category: 'Footwear',
//       status: 'Active',
//       seller: 'YourShop',
//       image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
//       highlighted: true
//     },
//     {
//       id: 3,
//       name: 'Vintage Camera',
//       price: '$249.99',
//       category: 'Electronics',
//       status: 'Active',
//       seller: 'YourShop',
//       image: 'https://images.pexels.com/photos/821651/pexels-photo-821651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
//       {/* Back Button */}
//       <button
//         onClick={() => navigate('/dashboard')}
//         className="mb-6 flex items-center text-sm text-indigo-400 hover:text-indigo-200"
//       >
//         <ArrowLeft className="w-4 h-4 mr-2" />
//         Back to Dashboard
//       </button>

//       {/* Header and Add New Button */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <h1 className="text-3xl font-bold">My Listings</h1>
//         <button
//           className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
//           onClick={() => navigate('/dashboard/add-product')}
//         >
//           <Plus className="h-5 w-5" />
//           <span>Add New</span>
//         </button>
//       </div>

//       {/* Search Bar */}
//       <div className="mb-6">
//         <SearchBar />
//       </div>

//       {/* Filter Buttons */}
//       <div className="mb-6">
//         <FilterButtons />
//       </div>

//       {/* Product List */}
//       <div className="space-y-4">
//         {products.length === 0 ? (
//           <div className="text-center text-gray-400 py-20">
//             No listings yet. Click <span className="font-semibold text-indigo-400">Add New</span> to create your first product!
//           </div>
//         ) : (
//           products.map((product) => (
//             <ProductCard
//               key={product.id}
//               name={product.name}
//               price={product.price}
//               category={product.category}
//               status={product.status}
//               seller={product.seller}
//               image={product.image}
//               highlighted={product.highlighted}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyListings;


import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from './SearchBar';
import FilterButtons from './FilterButtons';
import ProductCard from './ProductCard';

const MyListings = () => {
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all', // 'active', 'sold', 'all'
    category: '',
    search: ''
  });

  // Fetch products from API
  const fetchProducts = useCallback(async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem('authToken'); // Adjust this based on your auth implementation
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString()
      });

      if (currentFilters.status && currentFilters.status !== 'all') {
        params.append('status', currentFilters.status);
      }

      if (currentFilters.category) {
        params.append('category', currentFilters.category);
      }

      // Make API call
      const response = await axios.get('http://localhost:8080/api/v1/products?', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || {});
      }

    } catch (err) {
      console.error('Error fetching products:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        // Optionally redirect to login
        // navigate('/login');
      } else if (err.response?.status === 404) {
        setError('User not found.');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch products. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.per_page]);

  // Initial load
  useEffect(() => {
    fetchProducts(1, filters);
  }, [fetchProducts, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchProducts(1, newFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchProducts(newPage, filters);
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    const newFilters = { ...filters, search: searchTerm };
    handleFilterChange(newFilters);
  };

  // Filter products by search term (client-side filtering for search)
  const filteredProducts = products.filter(product => {
    if (!filters.search) return true;
    return product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
           product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
           product.category.toLowerCase().includes(filters.search.toLowerCase());
  });

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <span className="ml-2 text-lg">Loading your listings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center text-sm text-indigo-400 hover:text-indigo-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        {/* Header and Add New Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <button
            onClick={() => navigate('/dashboard/add-product')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-200">
            <p>{error}</p>
            <button
              onClick={() => fetchProducts(pagination.page, filters)}
              className="mt-2 text-sm text-red-400 hover:text-red-200 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <FilterButtons 
            activeFilter={filters.status}
            onFilterChange={(status) => handleFilterChange({ ...filters, status })}
          />
        </div>

        {/* Loading indicator for subsequent loads */}
        {loading && products.length > 0 && (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
          </div>
        )}

        {/* Product List */}
        <div className="space-y-4">
          {filteredProducts.length === 0 && !loading ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg mb-4">
                {filters.search || filters.status !== 'all' || filters.category 
                  ? 'No products found matching your criteria.'
                  : 'No listings yet. Click Add New to create your first product!'
                }
              </p>
              {(filters.search || filters.status !== 'all' || filters.category) && (
                <button
                  onClick={() => handleFilterChange({ status: 'all', category: '', search: '' })}
                  className="text-indigo-400 hover:text-indigo-200 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  status: product.is_sold ? 'Sold' : 'Active',
                  seller: 'YourShop', // You might want to get this from user data
                  image: product.image_url
                }}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-gray-300">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        )}

        {/* Products count */}
        {pagination.total > 0 && (
          <div className="mt-4 text-center text-gray-400 text-sm">
            Showing {filteredProducts.length} of {pagination.total} products
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
