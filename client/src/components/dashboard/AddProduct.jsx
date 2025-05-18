import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import Button from '../ui/Button'; // Adjust path as needed

const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload/preview here
      console.log('Selected file:', file.name);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-[480px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          {/* Logo as image placeholder */}
          <div className="h-8 w-20 bg-gray-300 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">Logo</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Cart icon links to cart page */}
            <Link
              to="/dashboard/cart"
              className="w-9 h-9 flex items-center justify-center bg-[#23293a] rounded-md hover:bg-[#2a3142] border border-white/30 transition"
              aria-label="Go to cart"
            >
              <ShoppingCart className="w-6 h-6 text-gray-300" />
            </Link>
            {/* Profile icon links to profile page */}
            <button
              onClick={() => navigate('/dashboard/profile')}
              aria-label="Go to profile"
              className="w-9 h-9 flex items-center justify-center bg-[#23293a] rounded-md hover:bg-[#2a3142] border border-white/30 transition"
            >
              <User className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>
        {/* Product Details Heading */}
        <h2 className="text-white text-2xl font-extrabold text-center mb-6 tracking-wide drop-shadow-lg">
          Product Details
        </h2>
        <div className="border border-white/30 rounded-xl p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <button
              className="border border-white/40 rounded-lg px-8 py-4 text-white bg-white/10 hover:bg-white/20 transition mb-4"
              onClick={handleImageClick}
              type="button"
            >
              Add product Image
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
          <form className="space-y-3">
            <input className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Product Title" />
            <input className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Product Category" />
            <textarea className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Product Description" />
            <input className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Price" type="number" />
            <input className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Quantity" type="number" />
            <input className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Condition" />
            <input className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Year of Manufacture (if applicable)" />
            <input className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Brand" />
            <input className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Model" />
            <input className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Dimensions (Length, Width, Height)" />
            <input className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Weight" />
            <label className="flex items-center text-white">
              <input type="checkbox" className="mr-2" />
              Original Packaging
            </label>
            <label className="flex items-center text-white">
              <input type="checkbox" className="mr-2" />
              Manual/Instructions Included
            </label>
            <textarea className="w-full rounded bg-gray-900/60 text-white px-3 py-2 mb-1" placeholder="Working Condition Description" />
            {/* Add Product Button */}
            <Button type="submit" variant="primary" className="w-full mt-4">
              Add Product
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
