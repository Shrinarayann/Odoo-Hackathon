import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import FilterButtons from './FilterButtons';
import ProductCard from './ProductCard';

const PreviousPurchases = () => {
  const navigate = useNavigate();

  const purchaseHistory = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: '$129.99',
      category: 'Electronics',
      seller: 'AudioTech',
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 2,
      name: 'Minimalist Watch',
      price: '$89.99',
      category: 'Accessories',
      seller: 'TimeKeeper',
      image: 'https://images.pexels.com/photos/9978709/pexels-photo-9978709.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 3,
      name: 'Organic Coffee Beans',
      price: '$24.99',
      category: 'Food & Beverages',
      seller: 'BeanMaster',
      image: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-white hover:text-indigo-400"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Dashboard
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Previous Purchases</h1>
      </div>

      <div className="mb-6">
        <SearchBar />
      </div>

      <div className="mb-6">
        <FilterButtons />
      </div>

      <div className="space-y-4">
        {purchaseHistory.map((purchase) => (
          <ProductCard
            key={purchase.id}
            name={purchase.name}
            price={purchase.price}
            category={purchase.category}
            status="Purchased"
            seller={purchase.seller}
            image={purchase.image}
          />
        ))}
      </div>
    </div>
  );
};

export default PreviousPurchases;
