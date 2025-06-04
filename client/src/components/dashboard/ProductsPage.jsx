import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Filter, X, MapPin, Package, Tag, Star, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ProductsPage = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ search: '', priceRange: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('ProductsPage useEffect triggered');
    console.log('Location state:', location.state);
    
    const data = location.state?.data;
    console.log("Received products from dashboard:", data);
    console.log("Type of data:", typeof data);
    console.log("Is data an array?", Array.isArray(data));
    
    if (Array.isArray(data)) {
      console.log("Setting products:", data);
      setProducts(data);
    } else {
      console.log("Data is not an array, setting empty array");
      setProducts([]);
    }
  }, [location.state]);

  // Additional debug log when products state changes
  useEffect(() => {
    console.log('Products state updated:', products);
    console.log('Products length:', products.length);
  }, [products]);

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
  };

  const handlePriceFilter = (priceRange) => {
    setFilters({ ...filters, priceRange });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter((product) => {
    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const matchesSearch = 
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // Price filter
    if (filters.priceRange !== 'all') {
      const price = parseFloat(product.price) || 0;
      switch (filters.priceRange) {
        case 'under-500':
          return price < 500;
        case '500-1000':
          return price >= 500 && price <= 1000;
        case '1000-5000':
          return price >= 1000 && price <= 5000;
        case 'above-5000':
          return price > 5000;
        default:
          return true;
      }
    }

    return true;
  });

  const addToCart = (product, e) => {
    e?.stopPropagation(); // Prevent modal from opening when adding to cart
    setCart((prev) => [...prev, product]);
    alert(`${product.name} added to cart!`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto mb-6 px-4">
        <div className="h-8 w-20 bg-gray-300 rounded-md flex items-center justify-center">
          <span className="text-gray-500 text-sm">Logo</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/cart')}
            className="w-9 h-9 flex items-center justify-center bg-[#23293a] rounded-md hover:bg-[#2a3142] border border-white/30 transition"
            aria-label="Go to cart"
          >
            <ShoppingCart className="w-6 h-6 text-gray-300" />
          </button>
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="w-9 h-9 flex items-center justify-center bg-[#23293a] rounded-md hover:bg-[#2a3142] border border-white/30 transition"
            aria-label="Go to profile"
          >
            <User className="w-6 h-6 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="w-full max-w-6xl mx-auto mb-6 px-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-3 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white font-medium">Price Range:</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handlePriceFilter(e.target.value)}
                    className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-500">Under Rs. 500</option>
                    <option value="500-1000">Rs. 500 - 1,000</option>
                    <option value="1000-5000">Rs. 1,000 - 5,000</option>
                    <option value="above-5000">Above Rs. 5,000</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="w-full max-w-6xl mx-auto px-4">
        {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-gray-800 rounded-lg p-4 flex flex-col cursor-pointer hover:bg-gray-750 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 transform hover:scale-105"
                onClick={() => handleProductClick(product)}
              >
                {/* Product Image */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg w-full h-48 flex items-center justify-center mb-3 overflow-hidden">
                  {product.image_url || product.image ? (
                    <img 
                      src={product.image_url || product.image} 
                      alt={product.name} 
                      className="object-cover h-full w-full transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 flex flex-col items-center">
                      <Package className="w-12 h-12 mb-2" />
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                
                {/* Product Description */}
                <div className="flex-1 flex flex-col">
                  <div className="font-bold mb-2 text-white text-lg line-clamp-2">{product.name || 'No Name'}</div>
                  <div className="mb-3 text-gray-300 text-sm flex-1 line-clamp-2">{product.description || 'No Description'}</div>
                  <div className="text-indigo-300 font-semibold mb-2 text-xl">
                    Rs. {product.price || 'Price not available'}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    Category: {product.category || 'No Category'}
                  </div>
                  {product.seller && (
                    <div className="text-sm text-gray-400 mb-3">
                      Seller: {product.seller.name} ({product.seller.phone})
                    </div>
                  )}
                  
                  {/* Add to Cart Button */}
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold w-full mt-auto transition-colors"
                    onClick={(e) => addToCart(product, e)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              {products.length === 0 ? 'No products found.' : 'No products match your search criteria.'}
            </p>
            <p className="text-gray-500 text-sm">
              {products.length === 0 
                ? `Debug: Products array has ${products.length} items`
                : `Showing ${filteredProducts.length} of ${products.length} products`
              }
            </p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg w-full h-80 flex items-center justify-center overflow-hidden">
                    {selectedProduct.image_url || selectedProduct.image ? (
                      <img 
                        src={selectedProduct.image_url || selectedProduct.image} 
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
                  <div className="text-3xl font-bold text-indigo-300">
                    Rs. {selectedProduct.price}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-300">{selectedProduct.description || 'No description available'}</p>
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
                        <div className="text-white mt-1">{selectedProduct.quantity || 0} units</div>
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
                    <button
                      onClick={(e) => addToCart(selectedProduct, e)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Close
                    </button>
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

export default ProductsPage;