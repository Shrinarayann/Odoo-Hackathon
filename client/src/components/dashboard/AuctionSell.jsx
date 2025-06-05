import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import Button from '../ui/Button';

const AuctionSell = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    product_name: '',
    category: 'General',
    product_description: '',
    base_price: '',
    auction_duration: '24',
    condition: 'Like New',
    seller_location: 'Mumbai, India',
    brand: '',
    model: '',
    image_url: '',
  });

  const handleImageClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Show local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image_url: e.target.result }));
      };
      reader.readAsDataURL(file);

      // Upload to ImgBB
      const form = new FormData();
      form.append('image', file);
      form.append('key', 'aa2c0db5996dc7741d2252c07bbb3761');

      setLoading(true);
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: form
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image_url: data.data.url }));
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      alert(error.message);
      setFormData(prev => ({ ...prev, image_url: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const auctionEndTime = new Date();
      auctionEndTime.setHours(auctionEndTime.getHours() + parseInt(formData.auction_duration));

      const payload = {
        product_name: formData.product_name,
        seller_name: user.name || 'Anonymous Seller',
        seller_id: user.id || '12345',
        product_description: formData.product_description,
        base_price: parseFloat(formData.base_price),
        auction_end_time: auctionEndTime.toISOString(),
        image_url: formData.image_url,
        category: formData.category,
        condition: formData.condition,
        seller_location: formData.seller_location
      };

      const response = await fetch('http://localhost:8000/api/auction/create-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Auction creation failed');
      }

      alert('Auction created successfully!');
      navigate('/dashboard/auction');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header remains unchanged */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/10 backdrop-blur-xl">
        <Link to="/dashboard">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/cart" className="w-10 h-10 flex items-center justify-center bg-[#23293a] rounded-md hover:bg-[#2a3142] border border-white/30 transition">
            <ShoppingCart className="w-6 h-6 text-gray-300" />
          </Link>
          <button onClick={() => navigate('/dashboard/profile')} className="w-10 h-10 flex items-center justify-center bg-[#23293a] rounded-md hover:bg-[#2a3142] border border-white/30 transition">
            <User className="w-6 h-6 text-gray-300" />
          </button>
        </div>
      </div>

      <main className="flex-grow flex items-start justify-center p-12">
        <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-10">
          <h2 className="text-white text-3xl font-extrabold text-center mb-10 tracking-wide drop-shadow-lg">
            Auction Item Details
          </h2>

          <div className="flex gap-10">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center justify-center w-1/3 border border-white/30 rounded-xl p-6 bg-gray-900/40">
              {!formData.image_url ? (
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="border border-white/40 rounded-lg px-10 py-6 text-white bg-white/10 hover:bg-white/20 transition mb-4 text-lg font-medium"
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Add Product Image'}
                </button>
              ) : (
                <div className="relative w-full">
                  <img
                    src={formData.image_url}
                    alt="Product Preview"
                    className="mt-4 rounded-lg shadow-lg w-full aspect-video object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Form Section */}
            <form className="w-2/3 space-y-5" onSubmit={handleSubmit}>
              <input
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className="w-full rounded bg-gray-900/60 text-white px-4 py-3"
                placeholder="Product Name"
                required
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded bg-gray-900/60 text-white px-4 py-3"
                required
              >
                <option value="General">General</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home">Home</option>
                <option value="Health">Health</option>
                <option value="Books">Books</option>
              </select>

              <textarea
                name="product_description"
                value={formData.product_description}
                onChange={handleInputChange}
                className="w-full rounded bg-gray-900/60 text-white px-4 py-3 min-h-[100px]"
                placeholder="Product Description"
                required
              />

              <div className="grid grid-cols-2 gap-6">
                <input
                  name="base_price"
                  type="number"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  placeholder="Base Price"
                  min="0"
                  step="0.01"
                  required
                />
                <select
                  name="auction_duration"
                  value={formData.auction_duration}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  required
                >
                  <option value="1">1 Hour</option>
                  <option value="6">6 Hours</option>
                  <option value="24">24 Hours</option>
                  <option value="48">48 Hours</option>
                  <option value="168">1 Week</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  placeholder="Brand (optional)"
                />
                <input
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  placeholder="Model (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  required
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Used - Acceptable">Used - Acceptable</option>
                </select>
                <select
                  name="seller_location"
                  value={formData.seller_location}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  required
                >
                  <option value="Mumbai, India">Mumbai, India</option>
                  <option value="Delhi, India">Delhi, India</option>
                  <option value="Bangalore, India">Bangalore, India</option>
                  <option value="Chennai, India">Chennai, India</option>
                  <option value="Hyderabad, India">Hyderabad, India</option>
                  <option value="Kolkata, India">Kolkata, India</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6 py-3 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Creating Auction...
                  </>
                ) : (
                  'Post For Auction'
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuctionSell;