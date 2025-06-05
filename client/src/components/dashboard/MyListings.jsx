// import React, { useState, useEffect } from 'react';
// import { Trash2, Search, ShoppingCart, User, Loader2, X, Package, Tag, MapPin, Clock } from 'lucide-react';
// import { useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';

// const MyListings = () => {
//   const navigate = useNavigate();
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);
//   const [filters, setFilters] = useState({ search: '' });
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     per_page: 10,
//     total: 0,
//     pages: 0,
//   });

//   const fetchProducts = async (page = 1) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const token = localStorage.getItem('authToken');
//       if (!token) {
//         setError('Authentication token not found');
//         navigate('/login'); // Redirect to login if no token
//         return;
//       }

//       const response = await axios.get('http://localhost:8080/api/v1/products/', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         params: {
//           page,
//           per_page: pagination.per_page,
//         },
//       });

//       console.log('API Response:', response.data); // Debug log

//       if (response.data?.success && response.data?.products) {
//         setProducts(response.data.products);
//         setPagination(response.data.pagination || { 
//           page: page, 
//           per_page: pagination.per_page, 
//           total: response.data.products.length, 
//           pages: 1 
//         });
//       } else {
//         setError(response.data?.message || 'Failed to fetch products');
//       }
//     } catch (err) {
//       console.error('Fetch error:', err); // Debug log
      
//       if (err.response?.status === 401) {
//         setError('Authentication failed. Please login again.');
//         localStorage.removeItem('authToken');
//         navigate('/login');
//       } else {
//         setError(err.response?.data?.message || 'Something went wrong.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts(pagination.page);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pagination.page]);

//   const handleSearch = (searchTerm) => {
//     setFilters({ ...filters, search: searchTerm });
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= pagination.pages) {
//       setPagination((prev) => ({ ...prev, page: newPage }));
//     }
//   };

//   const handleProductClick = (product) => {
//     setSelectedProduct(product);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedProduct(null);
//   };

//   const filteredProducts = products.filter((product) => {
//     if (!filters.search) return true;
//     const term = filters.search.toLowerCase();
//     return (
//       (product.name || '').toLowerCase().includes(term) ||
//       (product.description || '').toLowerCase().includes(term) ||
//       (product.category || '').toLowerCase().includes(term)
//     );
//   });

//   const handleDelete = async (productId, e) => {
//     e?.stopPropagation(); // Prevent modal from opening when deleting
//     if (!window.confirm('Are you sure you want to delete this product?')) return;
    
//     setDeletingId(productId);
//     try {
//       const token = localStorage.getItem('authToken');
//       await axios.delete(`http://localhost:8080/api/v1/products/${productId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       // Remove the product from the local state
//       setProducts((prev) => prev.filter((product) => 
//         (product._id || product.id) !== productId
//       ));
      
//       // Update pagination if needed
//       setPagination(prev => ({
//         ...prev,
//         total: Math.max(0, prev.total - 1)
//       }));
      
//     } catch (err) {
//       console.error('Delete error:', err);
//       alert(err.response?.data?.message || 'Failed to delete product.');
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const getConditionColor = (condition) => {
//     switch (condition?.toLowerCase()) {
//       case 'new':
//         return 'text-green-400 bg-green-400/10 border-green-400/20';
//       case 'like new':
//         return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
//       case 'good':
//         return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
//       case 'fair':
//         return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
//       case 'poor':
//         return 'text-red-400 bg-red-400/10 border-red-400/20';
//       default:
//         return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
//         <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
//         <span className="ml-2">Loading products...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center">
//         <div className="text-center">
//           <p>{error}</p>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-6">
//       <header className="bg-gray-800 shadow-lg mb-4">
//         <div className="w-full py-2 px-4 flex justify-between items-center">
//           <Link to="/dashboard">
//             <img src="/logo.png" alt="Logo" className="h-11 w-auto" />
//           </Link>

//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 onChange={(e) => handleSearch(e.target.value)}
//                 className="w-64 bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//               <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
//             </div>
//             <button onClick={() => navigate('/dashboard/cart')} className="text-gray-400 hover:text-white">
//               <ShoppingCart className="h-6 w-6" />
//             </button>
//             <button onClick={() => navigate('/dashboard/profile')} className="text-gray-400 hover:text-white">
//               <User className="h-8 w-8" />
//             </button>
//           </div>
//         </div>
//       </header>

//       <h1 className="text-3xl font-bold mb-6">My Listings</h1>
      
//       {filteredProducts.length === 0 ? (
//         <div className="text-center text-gray-400 py-12">
//           {products.length === 0 ? 'No products found. Start by adding your first product!' : 'No products match your search.'}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {filteredProducts.map((product) => (
//             <div 
//               key={product._id || product.id} 
//               className="bg-gray-800 rounded-xl p-4 shadow relative group transition cursor-pointer hover:bg-gray-750 hover:shadow-lg hover:shadow-indigo-500/10 transform hover:scale-105"
//               onClick={() => handleProductClick(product)}
//             >
//               <img
//                 src={product.image_url || 'https://via.placeholder.com/150'}
//                 alt={product.name || 'Product'}
//                 className="w-full h-40 object-cover rounded-md mb-4 transition-transform duration-300 hover:scale-110"
//                 onError={(e) => {
//                   e.target.src = 'https://via.placeholder.com/150';
//                 }}
//               />
//               <h2 className="text-xl font-semibold">{product.name || 'Unnamed Product'}</h2>
//               <p className="text-sm text-gray-400">{product.category || 'No Category'}</p>
//               <p className="text-sm text-gray-400">₹{product.price || 0}</p>
//               <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description || 'No description'}</p>

//               <button
//                 className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 z-10"
//                 onClick={(e) => handleDelete(product._id || product.id, e)}
//                 disabled={deletingId === (product._id || product.id)}
//                 title="Delete"
//               >
//                 {deletingId === (product._id || product.id) ? (
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                 ) : (
//                   <Trash2 className="w-5 h-5" />
//                 )}
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Pagination Controls */}
//       {pagination.pages > 1 && (
//         <div className="mt-8 flex justify-center items-center gap-4">
//           <button
//             onClick={() => handlePageChange(pagination.page - 1)}
//             disabled={pagination.page <= 1}
//             className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 disabled:cursor-not-allowed"
//           >
//             Previous
//           </button>
//           <span className="text-gray-400">Page {pagination.page} of {pagination.pages}</span>
//           <button
//             onClick={() => handlePageChange(pagination.page + 1)}
//             disabled={pagination.page >= pagination.pages}
//             className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 disabled:cursor-not-allowed"
//           >
//             Next
//           </button>
//         </div>
//       )}

//       {/* Product Count */}
//       {pagination.total > 0 && (
//         <div className="mt-4 text-center text-gray-400 text-sm">
//           Showing {filteredProducts.length} of {pagination.total} products
//         </div>
//       )}

//       {/* Product Detail Modal */}
//       {showModal && selectedProduct && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//           <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             {/* Modal Header */}
//             <div className="flex justify-between items-center p-6 border-b border-gray-700">
//               <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
//               <button
//                 onClick={closeModal}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Product Image */}
//                 <div className="space-y-4">
//                   <div className="bg-gray-900 border border-gray-700 rounded-lg w-full h-80 flex items-center justify-center overflow-hidden">
//                     {selectedProduct.image_url ? (
//                       <img
//                         src={selectedProduct.image_url}
//                         alt={selectedProduct.name}
//                         className="object-contain h-full w-full"
//                         onError={(e) => {
//                           console.log('Image failed to load:', e.target.src);
//                           e.target.style.display = 'none';
//                         }}
//                       />
//                     ) : (
//                       <div className="text-gray-500 flex flex-col items-center">
//                         <Package className="w-16 h-16 mb-2" />
//                         <span>No Image Available</span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Status Badges */}
//                   <div className="flex gap-2">
//                     {selectedProduct.auction_status && (
//                       <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full flex items-center gap-1">
//                         <Clock className="w-4 h-4" />
//                         Auction Item
//                       </span>
//                     )}
//                     {selectedProduct.status && (
//                       <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
//                         Available
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Product Details */}
//                 <div className="space-y-6">
//                   {/* Price */}
//                   <div className="text-3xl font-bold text-indigo-300">
//                     ₹{selectedProduct.price}
//                   </div>

//                   {/* Description */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
//                     <p className="text-gray-300">{selectedProduct.description || 'No description available'}</p>
//                   </div>

//                   {/* Product Specifications */}
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="space-y-3">
//                       <div>
//                         <span className="text-gray-400 text-sm">Category</span>
//                         <div className="flex items-center gap-2 mt-1">
//                           <Tag className="w-4 h-4 text-indigo-400" />
//                           <span className="text-white">{selectedProduct.category || 'Not specified'}</span>
//                         </div>
//                       </div>

//                       {selectedProduct.brand && (
//                         <div>
//                           <span className="text-gray-400 text-sm">Brand</span>
//                           <div className="text-white mt-1">{selectedProduct.brand}</div>
//                         </div>
//                       )}

//                       {selectedProduct.model && (
//                         <div>
//                           <span className="text-gray-400 text-sm">Model</span>
//                           <div className="text-white mt-1">{selectedProduct.model}</div>
//                         </div>
//                       )}

//                       <div>
//                         <span className="text-gray-400 text-sm">Condition</span>
//                         <div className="mt-1">
//                           <span className={`px-2 py-1 rounded-full text-xs border ${getConditionColor(selectedProduct.condition)}`}>
//                             {selectedProduct.condition || 'Not specified'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-3">
//                       <div>
//                         <span className="text-gray-400 text-sm">Quantity Available</span>
//                         <div className="text-white mt-1">{selectedProduct.quantity || 0} units</div>
//                       </div>

//                       {selectedProduct.seller_location && (
//                         <div>
//                           <span className="text-gray-400 text-sm">Location</span>
//                           <div className="flex items-center gap-2 mt-1">
//                             <MapPin className="w-4 h-4 text-red-400" />
//                             <span className="text-white">{selectedProduct.seller_location}</span>
//                           </div>
//                         </div>
//                       )}

//                       {selectedProduct.seller && (
//                         <div>
//                           <span className="text-gray-400 text-sm">Seller</span>
//                           <div className="text-white mt-1">
//                             <div>{selectedProduct.seller.name}</div>
//                             <div className="text-sm text-gray-400">{selectedProduct.seller.phone}</div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="flex gap-4 pt-4">
//                     <button
//                       onClick={(e) => handleDelete(selectedProduct._id || selectedProduct.id, e)}
//                       disabled={deletingId === (selectedProduct._id || selectedProduct.id)}
//                       className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
//                     >
//                       {deletingId === (selectedProduct._id || selectedProduct.id) ? (
//                         <Loader2 className="w-5 h-5 animate-spin" />
//                       ) : (
//                         <Trash2 className="w-5 h-5" />
//                       )}
//                       Delete Product
//                     </button>
//                     <button
//                       onClick={closeModal}
//                       className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyListings;

import React, { useState, useEffect } from 'react';
import { Trash2, Search, ShoppingCart, User, Loader2, X, Package, Tag, MapPin, Clock, Edit3, Save, XCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const MyListings = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filters, setFilters] = useState({ search: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 0,
  });

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        navigate('/login'); // Redirect to login if no token
        return;
      }

      const response = await axios.get('http://localhost:8080/api/v1/products/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          per_page: pagination.per_page,
        },
      });

      console.log('API Response:', response.data); // Debug log

      if (response.data?.success && response.data?.products) {
        setProducts(response.data.products);
        setPagination(response.data.pagination || { 
          page: page, 
          per_page: pagination.per_page, 
          total: response.data.products.length, 
          pages: 1 
        });
      } else {
        setError(response.data?.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Fetch error:', err); // Debug log
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      quantity: product.quantity || ''
    });
    setShowModal(true);
    setIsEditing(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setIsEditing(false);
    setEditForm({
      name: '',
      description: '',
      price: '',
      quantity: ''
    });
  };

  const filteredProducts = products.filter((product) => {
    if (!filters.search) return true;
    const term = filters.search.toLowerCase();
    return (
      (product.name || '').toLowerCase().includes(term) ||
      (product.description || '').toLowerCase().includes(term) ||
      (product.category || '').toLowerCase().includes(term)
    );
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: selectedProduct.name || '',
      description: selectedProduct.description || '',
      price: selectedProduct.price || '',
      quantity: selectedProduct.quantity || ''
    });
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;

    // Validate form
    if (!editForm.name.trim() || !editForm.description.trim() || !editForm.price || !editForm.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(editForm.price) < 0 || parseInt(editForm.quantity) < 0) {
      alert('Price and quantity must be positive numbers');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('authToken');
      const updateData = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: parseInt(editForm.price),
        quantity: parseInt(editForm.quantity)
      };

      const response = await axios.put(
        `http://localhost:8080/api/v1/products/${selectedProduct._id || selectedProduct.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data?.success) {
        // Update the product in local state
        const updatedProduct = { ...selectedProduct, ...updateData };
        setSelectedProduct(updatedProduct);
        
        // Update products list
        setProducts(prev => prev.map(p => 
          (p._id || p.id) === (selectedProduct._id || selectedProduct.id) 
            ? updatedProduct 
            : p
        ));
        
        setIsEditing(false);
        alert('Product updated successfully!');
      } else {
        alert(response.data?.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert(err.response?.data?.message || 'Failed to update product');
    } finally {
      setIsUpdating(false);
    }
  };

  // Fixed handleDelete function
  const handleDelete = async (productId, e) => {
    e?.stopPropagation(); // Prevent modal from opening when deleting
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setDeletingId(productId);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:8080/api/v1/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Remove the product from the local state
      setProducts((prev) => prev.filter((product) => 
        (product._id || product.id) !== productId
      ));
      
      // Update pagination if needed
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
      
      // Close modal if the deleted product was being viewed
      if (selectedProduct && (selectedProduct._id || selectedProduct.id) === productId) {
        closeModal();
      }
      
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'like new':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'good':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'fair':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'poor':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
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
        <div className="text-center">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
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
      
      {filteredProducts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          {products.length === 0 ? 'No products found. Start by adding your first product!' : 'No products match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product._id || product.id} 
              className="bg-gray-800 rounded-xl p-4 shadow relative group transition cursor-pointer hover:bg-gray-750 hover:shadow-lg hover:shadow-indigo-500/10 transform hover:scale-105"
              onClick={() => handleProductClick(product)}
            >
              <img
                src={product.image_url || 'https://via.placeholder.com/150'}
                alt={product.name || 'Product'}
                className="w-full h-40 object-cover rounded-md mb-4 transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
              <h2 className="text-xl font-semibold">{product.name || 'Unnamed Product'}</h2>
              <p className="text-sm text-gray-400">{product.category || 'No Category'}</p>
              <p className="text-sm text-gray-400">₹{product.price || 0}</p>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description || 'No description'}</p>

              <button
                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 z-10"
                onClick={(e) => handleDelete(product._id || product.id, e)}
                disabled={deletingId === (product._id || product.id)}
                title="Delete"
              >
                {deletingId === (product._id || product.id) ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-400">Page {pagination.page} of {pagination.pages}</span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Product Count */}
      {pagination.total > 0 && (
        <div className="mt-4 text-center text-gray-400 text-sm">
          Showing {filteredProducts.length} of {pagination.total} products
        </div>
      )}

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? 'Edit Product' : selectedProduct.name}
              </h2>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors p-2"
                    title="Edit Product"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg w-full h-80 flex items-center justify-center overflow-hidden">
                    {selectedProduct.image_url ? (
                      <img
                        src={selectedProduct.image_url}
                        alt={selectedProduct.name}
                        className="object-contain h-full w-full"
                        onError={(e) => {
                          console.log('Image failed to load:', e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-gray-500 flex flex-col items-center">
                        <Package className="w-16 h-16 mb-2" />
                        <span>No Image Available</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex gap-2">
                    {selectedProduct.auction_status && (
                      <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Auction Item
                      </span>
                    )}
                    {selectedProduct.status && (
                      <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  {/* Price */}
                  <div>
                    <span className="text-gray-400 text-sm">Price</span>
                    <div className="text-3xl font-bold text-indigo-300 mt-1">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => handleFormChange('price', e.target.value)}
                          className="bg-gray-700 text-white rounded-lg px-3 py-2 text-xl font-bold w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter price"
                          min="0"
                        />
                      ) : (
                        `₹${selectedProduct.price}`
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Product Name</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className="bg-gray-700 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter product name"
                      />
                    ) : (
                      <p className="text-gray-300">{selectedProduct.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    {isEditing ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        className="bg-gray-700 text-white rounded-lg px-3 py-2 w-full h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Enter product description"
                      />
                    ) : (
                      <p className="text-gray-300">{selectedProduct.description || 'No description available'}</p>
                    )}
                  </div>

                  {/* Product Specifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">Category</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag className="w-4 h-4 text-indigo-400" />
                          <span className="text-white">{selectedProduct.category || 'Not specified'}</span>
                        </div>
                      </div>

                      {selectedProduct.brand && (
                        <div>
                          <span className="text-gray-400 text-sm">Brand</span>
                          <div className="text-white mt-1">{selectedProduct.brand}</div>
                        </div>
                      )}

                      {selectedProduct.model && (
                        <div>
                          <span className="text-gray-400 text-sm">Model</span>
                          <div className="text-white mt-1">{selectedProduct.model}</div>
                        </div>
                      )}

                      <div>
                        <span className="text-gray-400 text-sm">Condition</span>
                        <div className="mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getConditionColor(selectedProduct.condition)}`}>
                            {selectedProduct.condition || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">Quantity Available</span>
                        <div className="text-white mt-1">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.quantity}
                              onChange={(e) => handleFormChange('quantity', e.target.value)}
                              className="bg-gray-700 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter quantity"
                              min="0"
                            />
                          ) : (
                            `${selectedProduct.quantity || 0} units`
                          )}
                        </div>
                      </div>

                      {selectedProduct.seller_location && (
                        <div>
                          <span className="text-gray-400 text-sm">Location</span>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-red-400" />
                            <span className="text-white">{selectedProduct.seller_location}</span>
                          </div>
                        </div>
                      )}

                      {selectedProduct.seller && (
                        <div>
                          <span className="text-gray-400 text-sm">Seller</span>
                          <div className="text-white mt-1">
                            <div>{selectedProduct.seller.name}</div>
                            <div className="text-sm text-gray-400">{selectedProduct.seller.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          disabled={isUpdating}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleEdit}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit3 className="w-5 h-5" />
                          Edit Product
                        </button>
                        <button
                          onClick={(e) => handleDelete(selectedProduct._id || selectedProduct.id, e)}
                          disabled={deletingId === (selectedProduct._id || selectedProduct.id)}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          {deletingId === (selectedProduct._id || selectedProduct.id) ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                          Delete
                        </button>
                        <button
                          onClick={closeModal}
                          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;