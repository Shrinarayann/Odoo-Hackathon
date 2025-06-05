// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   Menu, Search, ShoppingCart, User, X, Plus, Info, Phone,
//   Package, MonitorSmartphone, Shirt, Home, HeartPulse, BookOpen, Dumbbell, LogOut
// } from 'lucide-react';
// import { Link, Outlet, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Profile from './Profile';
// import { Typewriter } from 'react-simple-typewriter';
// import { motion } from 'framer-motion';
// import ProductCard from './ProductCard';

// const Dashboard = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);

//   const [user, setUser] = useState({
//     displayName: 'Brilliant Ostrich',
//     email: 'ostrich@example.com',
//     profilePicture: '',
//     otherInfo: 'Member since 2023',
//   });

//   const [products, setProducts] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   const menuItems = [
//     { icon: Package, label: 'My Listings', path: '/dashboard/listings' },
//     { icon: Plus, label: 'Add Product', path: '/dashboard/products' },
//     { icon: Info, label: 'About', path: '/dashboard/about' },
//     { icon: Phone, label: 'Contact', path: '/dashboard/contact' },
//   ];

//   const categories = [
//     { icon: MonitorSmartphone, name: 'Electronics', description: 'Smart devices, laptops, and accessories for modern living.' },
//     { icon: Shirt, name: 'Clothing', description: 'Stylish wear for men, women, and kids.' },
//     { icon: Home, name: 'Home', description: 'Essentials and decor for every home.' },
//     { icon: HeartPulse, name: 'Health', description: 'Personal care, wellness, and fitness products.' },
//     { icon: BookOpen, name: 'Books', description: 'Reading materials and office supplies.' },
//     { icon: Dumbbell, name: 'Sports', description: 'Gear and tools for fitness and adventure.' },
//   ];

//   // Fetch products with pagination
//   const fetchProducts = useCallback(async (resetProducts = false) => {
//     if (loading || (!hasMore && !resetProducts)) return;

//     setLoading(true);
//     try {
//       const token = localStorage.getItem('authToken');
//       const currentPage = resetProducts ? 1 : page;
      
//       const response = await axios.get('http://localhost:8080/api/v1/products/all', {
//         params: { page: currentPage, limit: 9 },  // fetch 9 products per page (3 rows * 3 items)
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       if (response.data && response.data.success) {
//         const fetchedProducts = response.data.products || [];
        
//         if (resetProducts) {
//           setProducts(fetchedProducts);
//           setPage(2);
//         } else {
//           setProducts(prev => [...prev, ...fetchedProducts]);
//           setPage(prev => prev + 1);
//         }
        
//         setHasMore(fetchedProducts.length === 9); // if less than 9, no more pages
//       } else {
//         setHasMore(false);
//       }
//     } catch (err) {
//       console.error('Error fetching products:', err);
//       setHasMore(false);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, hasMore, loading]);

//   useEffect(() => {
//     fetchProducts(true); // fetch first page on mount with reset
//   }, []); // Empty dependency array is correct here

//   // Infinite scroll handler
//   const observer = useRef();
//   const lastProductElementRef = useCallback(node => {
//     if (loading) return;
//     if (observer.current) observer.current.disconnect();

//     observer.current = new IntersectionObserver(entries => {
//       if (entries[0].isIntersecting && hasMore) {
//         fetchProducts();
//       }
//     });

//     if (node) observer.current.observe(node);
//   }, [loading, hasMore, fetchProducts]);

//   const handleCategoryClick = async (categoryName) => {
//     try {
//       const token = localStorage.getItem('authToken');
//       const response = await axios.get(
//         'http://localhost:8080/api/v1/products/search',
//         {
//           params: { category: categoryName },
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       if (response.data && response.data.success && response.data.products) {
//         navigate('/dashboard/products', {
//           state: {
//             category: categoryName,
//             data: response.data.products
//           },
//         });
//       } else {
//         console.error('Unexpected response structure:', response.data);
//         alert('Failed to fetch products. Please try again.');
//       }
//     } catch (err) {
//       console.error('Error fetching category products:', err);
//       alert('Error fetching products. Check console for details.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900">
//       {/* Sidebar */}
//       <div className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-800 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
//         <div className="p-4 pt-20">
//           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
//             <X className="h-6 w-6" />
//           </button>
//           <div className="flex items-center space-x-3 mb-8 mt-4">
//             <User className="h-8 w-8 text-indigo-500" />
//             <span className="text-lg font-semibold text-white">Dashboard</span>
//           </div>
//           <nav className="space-y-2">
//             {menuItems.map((item, index) => (
//               <Link
//                 key={index}
//                 to={item.path}
//                 className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg p-3 transition-colors"
//                 onClick={() => setIsSidebarOpen(false)}
//               >
//                 <item.icon className="h-6 w-6" />
//                 <span>{item.label}</span>
//               </Link>
//             ))}
//           </nav>
//         </div>

//         {/* Logout button at the bottom */}
//         <div className="p-4">
//           <button
//             onClick={() => navigate('/')}
//             className="flex items-center space-x-3 w-full text-left text-red-400 hover:text-white hover:bg-red-600 rounded-lg p-3 transition-colors"
//           >
//             <LogOut className="h-6 w-6" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </div>

//       {/* Header */}
//       <header className="bg-gray-800 shadow-lg fixed w-full z-50 top-0">
//         <div className="w-full px-6 py-4 flex justify-between items-center">
//           <div className="flex items-center space-x-8">
//             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white">
//               <Menu className="h-8 w-8" />
//             </button>
//             <Link to="/dashboard">
//               <img src="/logo.png" alt="Logo" className="h-11 w-auto" />
//             </Link>
//           </div>
//           <div className="relative w-72 overflow-hidden h-10">
//             <motion.div
//               initial={{ x: -300 }}
//               animate={{ x: 1200 }}
//               transition={{
//                 duration: 8,
//                 repeat: Infinity,
//                 ease: 'linear',
//               }}
//               className="absolute top-0 left-0 text-yellow-300 text-sm font-bold bg-indigo-700 px-3 py-1 rounded-full shadow-md cursor-pointer flex items-center gap-2"
//               onClick={() => navigate('/dashboard/auction')}
//             >
//               🚂 <span>Auction is LIVE now! Click to join 🎉</span>
//             </motion.div>
//           </div>

//           <div className="flex items-center space-x-6">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="w-64 bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//               <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
//             </div>

//             <button
//               onClick={() => navigate('/dashboard/add-product')}
//               className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             >
//               <Plus className="h-6 w-6" />
//               <span>Sell</span>
//             </button>

//             <button
//               className="text-gray-400 hover:text-white"
//               onClick={() => navigate('/dashboard/cart')}
//               aria-label="Go to cart"
//             >
//               <ShoppingCart className="h-6 w-6" />
//             </button>

//             <button
//               className="text-gray-400 hover:text-white"
//               onClick={() => setIsProfileOpen(true)}
//               aria-label="Open profile"
//             >
//               <User className="h-6 w-6" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main content */}
//       <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Auction Banner */}
//         <div className="relative rounded-xl overflow-hidden mb-8 h-64 cursor-pointer">
//           <img
//             src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
//             alt="Auction Banner"
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent flex items-center p-8">
//             <h1 className="text-4xl font-bold text-white">
//               <Typewriter
//                 words={[
//                   'Explore Sustainable Finds Near You',
//                   'Buy & Sell Pre-loved Products with Purpose',
//                 ]}
//                 loop={0}
//                 cursor
//                 cursorStyle="|"
//                 typeSpeed={50}
//                 deleteSpeed={40}
//                 delaySpeed={2000}
//               />
//             </h1>
//           </div>
//         </div>

//         {/* Categories */}
//         <div className="mb-8">
//           <h2 className="text-xl font-semibold text-white mb-4">All Categories</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {categories.map((cat, idx) => (
//               <div
//                 key={idx}
//                 className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
//                 onClick={() => handleCategoryClick(cat.name)}
//               >
//                 <cat.icon className="h-8 w-8 text-indigo-400 mb-3" />
//                 <h3 className="text-lg font-medium text-white">{cat.name}</h3>
//                 <p className="text-gray-400 mt-2">{cat.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Recommended Products */}
//         <div className="mb-12">
//           <h2 className="text-xl font-semibold text-white mb-6">Recommended Products</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {products.map((product, index) => {
//               const productCard = (
//                 <ProductCard
//                   key={product._id || product.id}
//                   name={product.name}
//                   price={product.price}
//                   category={product.category}
//                   status={product.condition}
//                   seller={product.seller}
//                   image={product.image_url}
//                   highlighted={false}
//                 />
//               );

//               if (products.length === index + 1) {
//                 return (
//                   <div key={product._id || product.id} ref={lastProductElementRef}>
//                     {productCard}
//                   </div>
//                 );
//               }

//               return (
//                 <div key={product._id || product.id}>
//                   {productCard}
//                 </div>
//               );
//             })}
//           </div>

//           {loading && (
//             <p className="text-gray-400 mt-4 text-center">Loading more products...</p>
//           )}
//           {!hasMore && products.length > 0 && (
//             <p className="text-gray-400 mt-4 text-center">No more products to show.</p>
//           )}
//         </div>
//       </div>

//       {/* Profile Modal */}
//       {isProfileOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
//           <Profile
//             user={user}
//             onClose={() => setIsProfileOpen(false)}
//             onSave={(updatedUser) => {
//               setUser(updatedUser);
//               setIsProfileOpen(false);
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;



import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu, Search, ShoppingCart, User, X, Plus, Info, Phone,
  Package, MonitorSmartphone, Shirt, Home, HeartPulse, BookOpen, Dumbbell, LogOut,
  Filter, Tag, MapPin, Clock
} from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Profile from './Profile';
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';
import AuctionPage from './AuctionPage';
import ProductCard from './ProductCard';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [user, setUser] = useState({
    displayName: 'Brilliant Ostrich',
    email: 'ostrich@example.com',
    profilePicture: '',
    otherInfo: 'Member since 2023',
  });

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', priceRange: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const menuItems = [
    { icon: Package, label: 'My Listings', path: '/dashboard/listings' },
    { icon: Plus, label: 'Add To Cart', path: '/dashboard/products' },
    { icon: Info, label: 'About', path: '/dashboard/about' },
    { icon: Phone, label: 'Contact', path: '/dashboard/contact' },
  ];

  const categories = [
    { icon: MonitorSmartphone, name: 'Electronics', description: 'Smart devices, laptops, and accessories for modern living.' },
    { icon: Shirt, name: 'Clothing', description: 'Stylish wear for men, women, and kids.' },
    { icon: Home, name: 'Home', description: 'Essentials and decor for every home.' },
    { icon: HeartPulse, name: 'Health', description: 'Personal care, wellness, and fitness products.' },
    { icon: BookOpen, name: 'Books', description: 'Reading materials and office supplies.' },
    { icon: Dumbbell, name: 'Sports', description: 'Gear and tools for fitness and adventure.' },
  ];

  // Fetch products with pagination
  const fetchProducts = useCallback(async (resetProducts = false) => {
    if (loading || (!hasMore && !resetProducts)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const currentPage = resetProducts ? 1 : page;
      
      const response = await axios.get('http://localhost:8080/api/v1/products/all', {
        params: { page: currentPage, limit: 9 },  // fetch 9 products per page (3 rows * 3 items)
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        const fetchedProducts = response.data.products || [];
        
        if (resetProducts) {
          setProducts(fetchedProducts);
          setPage(2);
        } else {
          setProducts(prev => [...prev, ...fetchedProducts]);
          setPage(prev => prev + 1);
        }
        
        setHasMore(fetchedProducts.length === 9); // if less than 9, no more pages
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    fetchProducts(true); // fetch first page on mount with reset
  }, []); // Empty dependency array is correct here

  // Infinite scroll handler
  const observer = useRef();
  const lastProductElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchProducts();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchProducts]);

  const handleCategoryClick = async (categoryName) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'http://localhost:8080/api/v1/products/search',
        {
          params: { category: categoryName },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success && response.data.products) {
        navigate('/dashboard/products', {
          state: {
            category: categoryName,
            data: response.data.products
          },
        });
      } else {
        console.error('Unexpected response structure:', response.data);
        alert('Failed to fetch products. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching category products:', err);
      alert('Error fetching products. Check console for details.');
    }
  };

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

  const addToCart = (product, e) => {
    e?.stopPropagation();
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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-800 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 pt-20">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-3 mb-8 mt-4">
            <User className="h-8 w-8 text-indigo-500" />
            <span className="text-lg font-semibold text-white">Dashboard</span>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg p-3 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout button at the bottom */}
        <div className="p-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 w-full text-left text-red-400 hover:text-white hover:bg-red-600 rounded-lg p-3 transition-colors"
          >
            <LogOut className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gray-800 shadow-lg fixed w-full z-50 top-0">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white">
              <Menu className="h-8 w-8" />
            </button>
            <Link to="/dashboard">
              <img src="/logo.png" alt="Logo" className="h-11 w-auto" />
            </Link>
          </div>
          <div className="relative w-[28rem] overflow-hidden h-10">
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 1500 }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute top-0 left-0 text-yellow-300 text-sm font-bold bg-indigo-700 px-4 py-2 rounded-full shadow-md cursor-pointer flex items-center gap-2"
              onClick={() => navigate('/dashboard/auctionpage')}
            >
              🚂 <span>Auction is LIVE now! Click to join 🎉</span>
            </motion.div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64 bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>

            <button
              onClick={() => navigate('/dashboard/add-product')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Plus className="h-6 w-6" />
              <span>Sell</span>
            </button>

            <button
              className="text-gray-400 hover:text-white"
              onClick={() => navigate('/dashboard/cart')}
              aria-label="Go to cart"
            >
              <ShoppingCart className="h-6 w-6" />
            </button>

            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setIsProfileOpen(true)}
              aria-label="Open profile"
            >
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Filter Options */}
      {showFilters && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-gray-800 border-b border-gray-700 px-4 py-4">
          <div className="max-w-7xl mx-auto">
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
        </div>
      )}

      {/* Main content */}
      <div className={`${showFilters ? 'pt-48' : 'pt-32'} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
        {/* Auction Banner */}
        <div className="relative rounded-xl overflow-hidden mb-8 h-64 cursor-pointer">
          <img
            src="https://www.akeneo.com/wp-content/uploads/2023/10/AdobeStock_1016298003-768x548.jpeg"
            alt="Auction Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent flex items-center p-8">
            <h1 className="text-4xl font-bold text-white">
              <Typewriter
                words={[
                  'Explore Sustainable Finds Near You',
                  'Buy & Sell Pre-loved Products with Purpose',
                ]}
                loop={0}
                cursor
                cursorStyle="|"
                typeSpeed={50}
                deleteSpeed={40}
                delaySpeed={2000}
              />
            </h1>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">All Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleCategoryClick(cat.name)}
              >
                <cat.icon className="h-8 w-8 text-indigo-400 mb-3" />
                <h3 className="text-lg font-medium text-white">{cat.name}</h3>
                <p className="text-gray-400 mt-2">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const productCard = (
                <div
                  key={product._id || product.id}
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
              );

              if (filteredProducts.length === index + 1) {
                return (
                  <div key={product._id || product.id} ref={lastProductElementRef}>
                    {productCard}
                  </div>
                );
              }

              return productCard;
            })}
          </div>

          {loading && (
            <p className="text-gray-400 mt-4 text-center">Loading more products...</p>
          )}
          {!hasMore && filteredProducts.length > 0 && (
            <p className="text-gray-400 mt-4 text-center">No more products to show.</p>
          )}
          {filteredProducts.length === 0 && products.length > 0 && (
            <div className="text-center">
              <p className="text-gray-400 mb-4">No products match your search criteria.</p>
              <p className="text-gray-500 text-sm">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
          )}
        </div>
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

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Profile
            user={user}
            onClose={() => setIsProfileOpen(false)}
            onSave={(updatedUser) => {
              setUser(updatedUser);
              setIsProfileOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;