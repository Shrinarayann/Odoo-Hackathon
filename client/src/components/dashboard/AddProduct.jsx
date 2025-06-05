import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import Button from '../ui/Button';

const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '', 
    category: '',
    description: '',
    price: '',
    quantity: '',
    condition: '',
    seller_location: '',
    brand: '',
    model: '',
    image_url: '',
  });

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Show a loading indicator (optional)
  setFormData((prev) => ({
    ...prev,
    image_url: '', // reset while uploading
  }));

  // Convert file to base64
  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      // Remove the "data:image/xxx;base64," part
      const base64String = reader.result.split(',')[1];
      const formDataImg = new FormData();
      formDataImg.append('key', 'aa2c0db5996dc7741d2252c07bbb3761');
      formDataImg.append('image', base64String);

      const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formDataImg,
      });

      const data = await res.json();
      if (data && data.success) {
        setFormData((prev) => ({
          ...prev,
          image_url: data.data.url,
        }));
      } else {
        alert('Image upload failed');
        setFormData((prev) => ({
          ...prev,
          image_url: '',
        }));
      }
    } catch (err) {
      alert('Error uploading image');
      setFormData((prev) => ({
        ...prev,
        image_url: '',
      }));
    }
  };
  reader.readAsDataURL(file);
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('User not authenticated');
      return;
    }
    console.log(token);
    console.log(formData);
    try {
      const response = await fetch('http://localhost:8080/api/v1/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.status===201) {
        alert('Product added successfully!');
        navigate('/dashboard');
      } else {
        alert(result.error || 'Failed to add product');
      }
    } catch (err) {
      console.error('Error submitting product:', err);
      alert('Server error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/10 backdrop-blur-xl">
        <div className="h-10 w-24 bg-gray-300 rounded-md flex items-center justify-center">
          <span className="text-gray-500 font-semibold">Logo</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/cart"
            className="w-10 h-10 flex items-center justify-center bg-[#23293a] rounded-md hover:bg-[#2a3142] border border-white/30 transition"
            aria-label="Go to cart"
          >
            <ShoppingCart className="w-6 h-6 text-gray-300" />
          </Link>
          <button
            onClick={() => navigate('/dashboard/profile')}
            aria-label="Go to profile"
            className="w-10 h-10 flex items-center justify-center bg-[#23293a] rounded-md hover:bg-[#2a3142] border border-white/30 transition"
          >
            <User className="w-6 h-6 text-gray-300" />
          </button>
        </div>
      </div>

      <main className="flex-grow flex items-start justify-center p-12">
        <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-10">
          {/* Heading */}
          <h2 className="text-white text-3xl font-extrabold text-center mb-10 tracking-wide drop-shadow-lg">
            Product Details
          </h2>

          {/* Image upload and form side by side */}
          <div className="flex gap-10">
            {/* Image upload section */}
            <div className="flex flex-col items-center justify-center w-1/3 border border-white/30 rounded-xl p-6 bg-gray-900/40">
              <button
                className="border border-white/40 rounded-lg px-10 py-6 text-white bg-white/10 hover:bg-white/20 transition mb-4 text-lg font-medium"
                onClick={handleImageClick}
                type="button"
              >
                Add Product Image
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Product Preview"
                  className="mt-4 rounded-lg shadow-lg max-w-full h-auto"
                />
              )}
            </div>

            {/* Form section */}
            <form className="w-2/3 space-y-5" onSubmit={handleSubmit}>
              <input
                name="name"
                value={formData.name}
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
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Home">Home</option>
                <option value="Sports">Sports</option>
                <option value="Health">Health</option>
                <option value="Books">Books</option>
                <option value="Clothing">Clothing</option>
              </select>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded bg-gray-900/60 text-white px-4 py-3 resize-y min-h-[100px]"
                placeholder="Product Description"
                required
              />

              <div className="grid grid-cols-2 gap-6">
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  placeholder="Brand"
                  required
                />
                <input
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  placeholder="Model"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <input
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  placeholder="Price"
                  type="number"
                  required
                />
                <input
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  placeholder="Quantity"
                  type="number"
                  required
                />
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="rounded bg-gray-900/60 text-white px-4 py-3"
                  required
                >
                  <option value="">Select Condition</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Used - Acceptable">Used - Acceptable</option>
                </select>
              </div>

              <select
                name="seller_location"
                value={formData.seller_location}
                onChange={handleInputChange}
                className="w-full rounded bg-gray-900/60 text-white px-4 py-3"
                required
              >
                <option value="">Select Location</option>
                <option value="Mumbai, India">Mumbai, India</option>
                <option value="Delhi, India">Delhi, India</option>
                <option value="Bangalore, India">Bangalore, India</option>
                <option value="Chennai, India">Chennai, India</option>
                <option value="Hyderabad, India">Hyderabad, India</option>
                <option value="Kolkata, India">Kolkata, India</option>
              </select>

              <Button type="submit" variant="primary" className="w-full mt-6 py-3 text-lg font-semibold">
                Add Product
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;