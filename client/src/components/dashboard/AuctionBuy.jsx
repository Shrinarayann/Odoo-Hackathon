import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, DollarSign, Filter, Search, Gavel, User, Package, Heart, X } from 'lucide-react';
import axios from 'axios';

// ... (rest of your imports and component code before fetchProducts)

const AuctionBuy = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('ending_soon');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);

  const categories = ['All', 'Electronics', 'Clothing', 'Home', 'Health', 'Books', 'Sports'];

  const fetchProducts = useCallback(async () => {
    setLoading(true); // Indicate loading state
    try {
      // The old URL was dynamic: `http://localhost:8080/api/auction/products/${userData.id || '12345'}`
      // New URL for fetching all products:
      const response = await axios.get('http://localhost:8080/api/auction/products');
      
      if (response.data && response.data.success) {
        setProducts(response.data.products);
      } else {
        // Handle cases where the API call was successful but operation failed (success: false)
        console.error('Failed to fetch products:', response.data.message || 'API returned success: false');
        setProducts([]); // Clear products or set an error state to show in UI
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]); // Clear products or set an error state
    } finally {
      setLoading(false);
    }
  }, []); // Dependency array is empty as userData is no longer used here

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 30000); // Fetches every 30 seconds
    return () => clearInterval(interval);
  }, [fetchProducts]);

  useEffect(() => {
    filterAndSortProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchTerm, selectedCategory, sortBy]);

  // ... (rest of your AuctionBuy component: filterAndSortProducts, getRemainingTime, placeBid, ProductCard, ProductDetailModal, render logic)
  
  // Make sure filterAndSortProducts, getRemainingTime, placeBid, ProductCard, ProductDetailModal, 
  // and the main return JSX are included as they were in your original code.
  // The provided snippet was partial, so I'm only showing the modified fetchProducts and relevant useEffects.
  // The rest of your component (filterAndSortProducts, ProductCard, ProductDetailModal, JSX, etc.) remains the same.


  // Minimal placeholder for the rest of the component for this example:
  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ending_soon':
          return new Date(a.auction_end_time) - new Date(b.auction_end_time);
        case 'price_low':
          return a.current_highest_bid - b.current_highest_bid;
        case 'price_high':
          return b.current_highest_bid - a.current_highest_bid;
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });
    setFilteredProducts(filtered);
  };

  const getRemainingTime = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    if (diff <= 0) return 'Auction Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const placeBid = async () => { /* ... your existing placeBid logic ... */ 
        if (!bidAmount || parseFloat(bidAmount) <= selectedProduct.current_highest_bid) {
      alert('Bid must be higher than current highest bid');
      return;
    }

    setBidding(true);
    try {
      const userString = localStorage.getItem('user'); // Changed from 'user' to 'authToken' based on initial fetch, adjust if needed
      const userData = userString ? JSON.parse(userString) : {};

      await axios.post('http://localhost:8080/api/auction/place-bid', {
        product_id: selectedProduct._id,
        bidder_name: userData.name || 'Anonymous Bidder', // Ensure userData.name exists or provide fallback
        bidder_id: userData.id || '12345', // Ensure userData.id exists
        bid_amount: parseFloat(bidAmount)
      });

      // Optimistic update or refetch products
      const updatedProducts = products.map(p =>
        p._id === selectedProduct._id
          ? { ...p, current_highest_bid: parseFloat(bidAmount), highest_bidder: userData.name || 'Anonymous Bidder' }
          : p
      );
      setProducts(updatedProducts);

      const updatedSelectedProduct = { ...selectedProduct, current_highest_bid: parseFloat(bidAmount), highest_bidder: userData.name || 'Anonymous Bidder' };
      setSelectedProduct(updatedSelectedProduct);
      setBidAmount('');

      alert('Bid placed successfully!');
      // fetchProducts(); // Optionally refetch all products to ensure data consistency
    } catch (error) {
      console.error('Failed to place bid:', error.response ? error.response.data : error.message);
      alert(`Failed to place bid. ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setBidding(false);
    }
  };


  const ProductCard = ({ product }) => { /* ... your existing ProductCard component ... */ 
    const timeRemaining = getRemainingTime(product.auction_end_time);
    const isEnding = new Date(product.auction_end_time) - new Date() < 3600000; // Less than 1 hour

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        onClick={() => setSelectedProduct(product)}
        className="bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer relative group"
      >
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
            LIVE
          </div>
        </div>
        {isEnding && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              ENDING SOON
            </div>
          </div>
        )}
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2 truncate">{product.product_name}</h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.product_description}</p>
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-gray-400 text-xs">Current Bid</p>
              <p className="text-green-400 font-bold text-lg">${product.current_highest_bid.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Time Left</p>
              <p className={`font-semibold text-sm ${isEnding ? 'text-orange-400' : 'text-blue-400'}`}>
                {timeRemaining}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-gray-400 text-sm">{product.seller_name}</span>
            </div>
            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
              {product.category}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const ProductDetailModal = ({ product, onClose }) => { /* ... your existing ProductDetailModal component ... */ 
    const [timer, setTimer] = useState(getRemainingTime(product.auction_end_time));

    useEffect(() => {
      const intervalId = setInterval(() => {
        const remaining = getRemainingTime(product.auction_end_time);
        setTimer(remaining);
        if (remaining === 'Auction Ended') {
          clearInterval(intervalId);
        }
      }, 1000);
      return () => clearInterval(intervalId);
    }, [product.auction_end_time]);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{product.product_name}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center"><User className="h-4 w-4 mr-1" />{product.seller_name}</span>
                  <span className="flex items-center"><Package className="h-4 w-4 mr-1" />{product.category}</span>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="h-6 w-6" /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div>
              <img src={product.image_url} alt={product.product_name} className="w-full h-96 object-cover rounded-lg mb-4" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">{product.product_description}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <p className="text-gray-400 mb-1">Time Remaining</p>
                  <p className="text-3xl font-bold text-orange-400">{timer}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Current Highest Bid</p>
                  <p className="text-4xl font-bold text-green-400">${product.current_highest_bid.toLocaleString()}</p>
                  {product.highest_bidder && (<p className="text-sm text-gray-400 mt-1">by {product.highest_bidder}</p>)}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Gavel className="h-5 w-5 mr-2" />Place Your Bid</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Bid Amount (minimum: ${(product.current_highest_bid + 1).toLocaleString()})</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} min={product.current_highest_bid + 0.01} step="0.01" className="w-full bg-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder={`${(product.current_highest_bid + 0.01).toFixed(2)}`} />
                    </div>
                  </div>
                  <motion.button onClick={placeBid} disabled={bidding || !bidAmount || parseFloat(bidAmount) <= product.current_highest_bid} whileHover={{ scale: (bidding || !bidAmount || parseFloat(bidAmount) <= product.current_highest_bid) ? 1 : 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full py-3 rounded-lg font-semibold transition-all ${(bidding || !bidAmount || parseFloat(bidAmount) <= product.current_highest_bid) ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                    {bidding ? (<div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />Placing Bid...</div>) : 'Place Bid'}
                  </motion.button>
                </div>
              </div>
              {product.bid_history && product.bid_history.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Bids</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {product.bid_history.slice().reverse().slice(0, 5).map((bid, index) => ( // Ensure new array for reverse, take last 5
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">{bid.bidder_name}</span>
                        <span className="text-green-400 font-semibold">${bid.bid_amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) { /* ... your existing loading UI ... */ 
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4" />
          <p className="text-white">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return ( /* ... your existing main render JSX ... */ 
    <div className="min-h-screen bg-gray-900 p-6 pt-28">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center mb-4 lg:mb-0">
            <button onClick={() => navigate('/dashboard/auctionpage')} className="flex items-center text-indigo-400 hover:text-white transition-colors mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Auction
            </button>
            <h1 className="text-3xl font-bold text-white">Live Auctions</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search products..." className="bg-gray-800 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64" />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="ending_soon">Ending Soon</option>
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </motion.div>
        {filteredProducts.length === 0 && !loading ? ( // Added !loading condition here
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Package className="h-20 w-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Active Auctions Found</h3>
            <p className="text-gray-500">Try adjusting your search or filters, or check back later!</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map(product => (<ProductCard key={product._id} product={product} />))}
            </AnimatePresence>
          </motion.div>
        )}
        <AnimatePresence>
          {selectedProduct && (<ProductDetailModal product={selectedProduct} onClose={() => { setSelectedProduct(null); setBidAmount(''); }} />)}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuctionBuy;