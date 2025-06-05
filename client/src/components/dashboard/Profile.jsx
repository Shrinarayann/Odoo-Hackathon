import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Edit, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import axios from 'axios';

const Profile = ({
  user = {
    displayName: 'Guest',
    email: 'guest@example.com',
    profilePicture: '',
    location: 'Chennai',
    rating: 4.3,
  },
  onClose,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formUser, setFormUser] = useState(user);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:8080/v1/auth/verify-password',
        { email: user.email, password: oldPassword },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (res.data.success) {
        const formData = new FormData();
        formData.append('displayName', formUser.displayName);
        formData.append('location', formUser.location);
        formData.append('password', newPassword);
        if (profilePicFile) {
          formData.append('profilePicture', profilePicFile);
        }

        await axios.post(
          'http://localhost:8080/v1/auth/update-profile',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        setIsEditing(false);
        if (onSave) onSave(formUser);
      } else {
        alert('Incorrect old password.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while saving changes.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      setProfilePicFile(file);
    } else {
      alert('Only JPG and PNG images are allowed.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-10">
      <div
        ref={wrapperRef}
        className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-10 sm:p-12"
      >
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <img src="/logo.png" alt="Logo" className="h-10" />
          </Link>
          <button onClick={onClose} className="text-white text-2xl hover:text-red-400">&times;</button>
        </div>

        {/* Avatar + Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-indigo-500 border-4 border-white flex items-center justify-center overflow-hidden">
              {profilePicFile || formUser.profilePicture ? (
                <img
                  src={profilePicFile ? URL.createObjectURL(profilePicFile) : formUser.profilePicture}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="h-20 w-20 text-white" />
              )}
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-2 -right-2 bg-indigo-600 text-white rounded-full p-2 shadow-md hover:bg-indigo-700"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-white text-center sm:text-left">
            <h2 className="text-3xl font-bold">{formUser.displayName}</h2>
            <p className="text-indigo-300">{formUser.email}</p>
            <p className="text-indigo-400 mt-1">Rating: {formUser.rating} / 5</p>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <Input
              name="displayName"
              label="Display Name"
              value={formUser.displayName}
              onChange={handleChange}
              className="w-full"
            />
            <select
              name="location"
              value={formUser.location}
              onChange={handleChange}
              className="bg-white/20 text-white border border-white/30 rounded-xl px-4 py-2 focus:outline-none"
            >
              <option value="Chennai">Chennai</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              {/* Add more as needed */}
            </select>
            <Input
              type="password"
              label="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full"
            />
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
            />
            <div>
              <label className="block text-white mb-1">Profile Picture</label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="text-white bg-white/10 px-4 py-2 rounded-lg"
              />
            </div>
            <div className="flex gap-4 mt-6 sm:col-span-2">
              <Button type="submit" variant="primary" className="flex-1">
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Navigation Buttons */}
        {!isEditing && (
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link to="/dashboard/listings" className="flex-1">
              <Button variant="secondary" className="w-full">
                My Listings
              </Button>
            </Link>
            <Link to="/dashboard/purchases" className="flex-1">
              <Button variant="secondary" className="w-full">
                My Purchases
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
