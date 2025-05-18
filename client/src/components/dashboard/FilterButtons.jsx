import React from 'react';

const FilterButtons = () => {
  return (
    <div className="flex space-x-2">
      <button className="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
        Sort
      </button>
      <button className="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
        Filter
      </button>
      <button className="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
        Group by
      </button>
    </div>
  );
};

export default FilterButtons;