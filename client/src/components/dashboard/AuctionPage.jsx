import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gavel, DollarSign } from 'lucide-react';


const AuctionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 p-10 pt-28 flex flex-col items-center">
      {/* Back to Dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-8 flex items-center text-indigo-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Go to Dashboard
      </button>

      <h1 className="text-3xl text-indigo-400 font-bold mb-10">Auction Zone</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
        {/* Buy Auction Products */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => navigate('/dashboard/auctionbuy')}
          className="cursor-pointer bg-gray-800 p-10 rounded-2xl shadow-lg hover:bg-gray-700 transition-colors"
        >
          <div className="flex flex-col items-center text-center">
            <Gavel className="h-12 w-12 text-indigo-400 mb-4" />
            <h2 className="text-2xl font-semibold text-indigo-400 mb-2">Buy Products</h2>
            <p className="text-gray-400">Explore and bid on auction listings from the community.</p>
          </div>
        </motion.div>

        {/* Sell Auction Products */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={() => navigate('/dashboard/auctionsell')}
          className="cursor-pointer bg-gray-800 p-10 rounded-2xl shadow-lg hover:bg-gray-700 transition-colors"
        >
          <div className="flex flex-col items-center text-center">
            <DollarSign className="h-12 w-12 text-indigo-400 mb-4" />
            <h2 className="text-2xl font-semibold text-indigo-400 mb-2">Sell Products</h2>
            <p className="text-gray-400">List your products for auction and attract competitive bids.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuctionPage;