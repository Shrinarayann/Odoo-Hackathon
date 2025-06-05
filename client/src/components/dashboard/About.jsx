import React from 'react';
import { Users, Package, Handshake, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom'; 

const About = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen py-12 px-6 lg:px-32">
      <Link
        to="/dashboard"
        className="inline-flex items-center text-indigo-400 hover:text-indigo-600 font-semibold text-lg mb-8">
        ← Back to Dashboard
      </Link>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4">About EcoFinds</h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          EcoFinds is a sustainable second-hand marketplace where buyers and sellers trade pre-loved products.
          Our platform promotes eco-conscious shopping by giving new life to used items—reducing waste, lowering
          carbon footprints, and making great items affordable and accessible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
        <img
          src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
          alt="EcoFinds illustration"
          className="w-full rounded-xl shadow-xl"
        />
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Empowering a Circular Economy</h2>
          <p className="text-gray-300 mb-4">
            From electronics and fashion to books and home goods, EcoFinds empowers everyone to participate
            in a circular economy. Whether you're decluttering, discovering hidden gems, or trying to save money
            while saving the planet, EcoFinds is your go-to platform.
          </p>
          <p className="text-gray-300">
            With user-friendly tools, secure payments, and verified listings, EcoFinds is built for modern consumers
            who care about their impact.
          </p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-6">EcoFinds at a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <Users className="h-8 w-8 text-green-400 mb-2 mx-auto" />
            <h3 className="text-xl font-semibold">12,450+</h3>
            <p className="text-gray-400">Active Users</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <Package className="h-8 w-8 text-blue-400 mb-2 mx-auto" />
            <h3 className="text-xl font-semibold">18,300+</h3>
            <p className="text-gray-400">Products Traded</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <Handshake className="h-8 w-8 text-yellow-400 mb-2 mx-auto" />
            <h3 className="text-xl font-semibold">8,900+</h3>
            <p className="text-gray-400">Successful Deals</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <Leaf className="h-8 w-8 text-emerald-400 mb-2 mx-auto" />
            <h3 className="text-xl font-semibold">62 Tons</h3>
            <p className="text-gray-400">Waste Saved</p>
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <div className="bg-gray-800 p-10 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Meet the Developers</h2>
        <ul className="text-gray-300 space-y-2">
          <li><strong>Shrinarayan</strong> – Frontend and UX enthusiast, crafts seamless UI experiences.</li>
          <li><strong>Srikumar</strong> – Backend architect ensuring data security and smooth operations.</li>
          <li><strong>Shiva Ganesh</strong> – Systems and cloud integration expert, optimizing deployment and scale.</li>
          <li><strong>Prawin Kumar</strong> – AI and project visionary, leading innovation and coordination.</li>
        </ul>
        <p className="mt-6 text-gray-400">
          This project was built with a vision to reduce waste and encourage sustainability through a modern,
          intuitive e-commerce platform.
        </p>
      </div>
    </div>
  );
};

export default About;