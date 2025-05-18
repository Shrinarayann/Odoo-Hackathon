import React from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import FilterButtons from './FilterButtons';
import ProductCard from './ProductCard';

const MyListings = () => {
  const navigate = useNavigate();

  const products = [
    {
      id: 1,
      name: 'Premium Leather Jacket',
      price: '$299.99',
      category: 'Mink',
      status: 'Active',
      seller: 'YourShop',
      image: 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 2,
      name: 'Speedy Tiger',
      price: '$159.99',
      category: 'Footwear',
      status: 'Active',
      seller: 'YourShop',
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      highlighted: true
    },
    {
      id: 3,
      name: 'Vintage Camera',
      price: '$249.99',
      category: 'Electronics',
      status: 'Active',
      seller: 'YourShop',
      image: 'https://images.pexels.com/photos/821651/pexels-photo-821651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center text-sm text-indigo-400 hover:text-indigo-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white">
          <Plus className="h-5 w-5" />
          <span>Add New</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <SearchBar />
      </div>

      <div className="mb-6">
        <FilterButtons />
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            category={product.category}
            status={product.status}
            seller={product.seller}
            image={product.image}
            highlighted={product.highlighted}
          />
        ))}
      </div>
    </div>
  );
};

export default MyListings;
