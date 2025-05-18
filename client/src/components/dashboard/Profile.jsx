import React, { useState } from 'react';
import { ShoppingCart, User, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button'; // Adjust path as needed
import Input from '../ui/Input';   // Adjust path as needed

const Profile = ({
  user = {
    displayName: 'Guest',
    email: 'guest@example.com',
    profilePicture: '',
    otherInfo: 'Member since 2023',
  },
  onClose,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formUser, setFormUser] = useState(user);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    if (onSave) onSave(formUser);
  };

  return (
    <div className="relative w-[370px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 mx-auto my-10">
      {/* Close Button */}
      {onClose && (
        <button
          className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl"
          onClick={onClose}
          aria-label="Close profile"
        >
          &times;
        </button>
      )}

      {/* Top bar: Logo, Cart (as button), Profile */}
      <div className="flex items-center justify-between mb-8">
        <img src="/logo.svg" alt="Logo" className="h-8" />
        <div className="flex items-center gap-4">
          {/* Cart button navigates to /dashboard/cart */}
          <button
            type="button"
            className="hover:bg-indigo-100/10 rounded-full p-2 transition"
            aria-label="Open cart"
            onClick={() => navigate('/dashboard/cart')}
          >
            <ShoppingCart className="h-6 w-6 text-gray-300" />
          </button>
          {/* Profile icon */}
          <div className="w-9 h-9 rounded-full border-2 border-indigo-400 flex items-center justify-center">
            <User className="h-5 w-5 text-indigo-300" />
          </div>
        </div>
      </div>

      {/* Avatar and Edit */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-2">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-400 bg-transparent flex items-center justify-center">
            <User className="h-16 w-16 text-indigo-300" />
          </div>
          {!isEditing && (
            <button
              className="absolute top-2 right-2 bg-transparent text-indigo-400 rounded-full p-1 hover:bg-indigo-100/20"
              onClick={() => setIsEditing(true)}
              aria-label="Edit profile"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
        {isEditing ? (
          <form onSubmit={handleSave} className="w-full flex flex-col items-center gap-2 mt-2">
            <Input
              name="displayName"
              value={formUser.displayName}
              onChange={handleChange}
              placeholder="Name"
              label="Name"
              className="w-full"
              autoFocus
            />
            <Input
              name="email"
              value={formUser.email}
              onChange={handleChange}
              placeholder="Email"
              label="Email"
              className="w-full"
              type="email"
            />
            <Input
              name="otherInfo"
              value={formUser.otherInfo}
              onChange={handleChange}
              placeholder="Other Info"
              label="Other Info"
              className="w-full"
            />
            {/* Add more Input fields here for more user info */}
            <div className="flex gap-2 w-full mt-2">
              <Button type="submit" variant="primary" className="flex-1">
                Save
              </Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="text-2xl font-bold text-white mt-2">{formUser.displayName}</div>
            <div className="text-indigo-100">{formUser.email}</div>
            <div className="text-gray-300 text-sm">{formUser.otherInfo}</div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-4 mt-6">
        <Link to="/dashboard/listings">
          <Button variant="secondary" className="w-full text-center font-semibold">
            My Listings
          </Button>
        </Link>
        <Link to="/dashboard/purchases">
          <Button variant="secondary" className="w-full text-center font-semibold">
            My Purchases
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Profile;
