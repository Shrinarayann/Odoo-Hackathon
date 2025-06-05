import React from 'react';

const ProductCard = ({
  name,
  price,
  category,
  status,
  seller,
  image,
  highlighted = false
}) => {
  return (
    <div className="flex flex-col md:flex-row bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-all duration-300 mb-4">
      <div className="w-full md:w-1/3 aspect-square">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col w-full md:w-2/3">
        <div>
          {highlighted && (
            <div className="bg-amber-800 text-white px-2 py-1 rounded text-xs inline-block mb-2">
              {category}
            </div>
          )}
          <h3 className="text-lg font-medium text-white">{name}</h3>
          <p className="text-gray-400 mt-1">{price}</p>
          {!highlighted && <p className="text-gray-400 mt-1">{category}</p>}
          <p className="text-gray-400 mt-1">{status}</p>
          <p className="text-gray-400 mt-1">{seller}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;