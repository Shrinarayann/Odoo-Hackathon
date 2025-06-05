import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom'; 

const Contact = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen py-12 px-6 lg:px-32">
      <Link
        to="/dashboard"
        className="inline-flex items-center text-indigo-400 hover:text-indigo-600 font-semibold text-lg mb-8">
        ← Back to Dashboard
      </Link>
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-4">Get in Touch with EcoFinds</h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          We're here to help! Whether you have questions, feedback, or want to collaborate, drop us a message or reach out using the details below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto">
        {/* Left: Contact Info with Image */}
        <div className="flex flex-col justify-center items-center space-y-8">
          <img
            src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
            alt="EcoFinds contact illustration"
            className="rounded-2xl shadow-2xl w-full max-w-md object-cover"
          />

          <div className="space-y-6 text-center md:text-left">
            <h2 className="text-3xl font-bold text-indigo-400 mb-4">Contact Information</h2>
            <div className="flex items-center justify-center md:justify-start gap-4 text-indigo-400 text-lg">
              <Mail className="h-7 w-7" />
              <a
                href="mailto:ecofinds3@gmail.com"
                className="hover:text-indigo-600 transition-colors"
              >
                Mail Us: ecofinds3@gmail.com
              </a>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 text-indigo-400 text-lg">
              <Phone className="h-7 w-7" />
              <a href="tel:+919876543210" className="hover:text-indigo-600 transition-colors">
                Contact Us: +91 98765 43210
              </a>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 text-indigo-400 text-lg">
              <MapPin className="h-7 w-7" />
              <address className="not-italic">Chennai, Tamil Nadu, India</address>
            </div>
          </div>
        </div>

        {/* Right: Decorative Contact Cards */}
        <div className="space-y-10">
          <div className="bg-indigo-900/30 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-indigo-700 hover:scale-[1.03] transform transition-transform duration-300 cursor-pointer">
            <h3 className="text-2xl font-semibold mb-3 text-indigo-400">Email Us</h3>
            <p className="text-gray-300">
              Send your queries or feedback via email. We usually respond within 24 hours.
            </p>
            <a
              href="mailto:ecofinds3@gmail.com"
              className="inline-block mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-semibold text-white transition-colors"
            >
              Write an Email
            </a>
          </div>

          <div className="bg-indigo-900/30 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-indigo-700 hover:scale-[1.03] transform transition-transform duration-300 cursor-pointer">
            <h3 className="text-2xl font-semibold mb-3 text-indigo-400">Call Us</h3>
            <p className="text-gray-300">
              Prefer to speak? Give us a call during business hours for quick support.
            </p>
            <a
              href="tel:+919876543210"
              className="inline-block mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-semibold text-white transition-colors"
            >
              Call Now
            </a>
          </div>

          <div className="bg-indigo-900/30 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-indigo-700 hover:scale-[1.03] transform transition-transform duration-300 cursor-pointer">
            <h3 className="text-2xl font-semibold mb-3 text-indigo-400">Visit Us</h3>
            <p className="text-gray-300">
              We're based in Chennai. Drop by for a chat or to learn more about EcoFinds.
            </p>
            <address className="not-italic mt-2 font-semibold text-indigo-400">
              Chennai, Tamil Nadu, India
            </address>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;