import React from 'react';

const Auctions = () => {
  const auctionItems = [
    {
      name: 'Vintage Camera',
      currentBid: '$120',
      endTime: '2h 15m',
      image: 'https://via.placeholder.com/300x200?text=Camera',
    },
    {
      name: 'Antique Clock',
      currentBid: '$340',
      endTime: '1h 50m',
      image: 'https://via.placeholder.com/300x200?text=Clock',
    },
  ];

  return (
    <div className="text-white p-6">
      <h2 className="text-3xl font-bold mb-6">Live Auctions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {auctionItems.map((item, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-4 shadow hover:bg-gray-700 transition">
            <img src={item.image} alt={item.name} className="rounded-md mb-4" />
            <h3 className="text-xl font-semibold">{item.name}</h3>
            <p className="text-gray-400">Current Bid: {item.currentBid}</p>
            <p className="text-gray-500 text-sm">Ends in: {item.endTime}</p>
            <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              Place Bid
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Auctions;
