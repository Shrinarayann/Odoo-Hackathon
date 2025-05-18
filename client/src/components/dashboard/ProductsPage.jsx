import React, { useState } from 'react';
import { ShoppingCart, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRODUCTS = [
  {
    id: 1,
    name: 'Premium Leather Jacket',
    price: 29999,
    image: 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'A premium leather jacket for all seasons.'
  },
  {
    id: 2,
    name: 'Speedy Tiger',
    price: 15999,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Speedy Tiger sports shoes for ultimate comfort and speed.'
  },
  {
    id: 3,
    name: 'Vintage Camera',
    price: 24999,
    image: 'https://images.pexels.com/photos/821651/pexels-photo-821651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'A classic vintage camera for photography enthusiasts.'
  }
];

const ProductsPage = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-md mb-6">
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
      {/* Page Title */}
      <div className="w-full max-w-md mb-4">
        <div className="bg-gray-800 rounded-lg text-white text-center py-2 text-xl font-semibold">
          Product Page
        </div>
      </div>
      {/* Product List */}
      <div className="w-full max-w-md">
        {PRODUCTS.map(product => (
          <div key={product.id} className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col items-center">
              {/* Product Image */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg w-full h-64 flex items-center justify-center mb-4">
                <img src={product.image} alt={product.name} className="object-contain h-full max-h-60" />
              </div>
              {/* Dots for gallery (placeholder) */}
              <div className="flex justify-center mb-4">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="mx-1 w-2 h-2 rounded-full bg-gray-500 inline-block" />
                ))}
              </div>
              {/* Product Description */}
              <div className="border border-white/20 rounded-lg bg-gray-800 p-4 text-white min-h-[80px] w-full mb-4">
                <div className="font-bold mb-1">{product.name}</div>
                <div className="mb-2">{product.description}</div>
                <div className="text-indigo-300 font-semibold mb-2">Rs. {product.price}</div>
              </div>
              {/* Add to Cart Button */}
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-semibold w-full"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
