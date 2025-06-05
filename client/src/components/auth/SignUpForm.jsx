import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock, Check, Phone, MapPin, Image } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import OtpInput from './OtpInput';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    location: '',
    phoneNumber: '',
    profilePic: null,
  });
  const [formStage, setFormStage] = useState('initial');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePic') {
      setFormData(prev => ({ ...prev, profilePic: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/v1/auth/send-otp', {
        name: formData.displayName,
        email: formData.email,
        password: formData.password,
        location: formData.location,
        phone_number: formData.phoneNumber,
        // Handle profilePic upload separately in actual backend logic
      });

      if (res.data.success) {
        setOtpSent(true);
        setFormStage('otp');
        setErrors({});
      } else {
        setErrors({ general: res.data.message || 'Failed to send OTP' });
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = Array.isArray(otp) ? otp.join('') : String(otp);

    if (otpString.length !== 6) {
      setErrors({ general: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/v1/auth/verify-otp', {
        email: formData.email,
        otp: otpString,
      });

      if (res.data.success) {
        setFormStage('completed');
        setTimeout(() => {
          navigate('/', { state: { email: formData.email } });
        }, 2000);
      } else {
        setErrors({ general: res.data.message || 'OTP verification failed' });
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'OTP verification failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormFields = () => (
    <>
      <div className="relative">
        <Input
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="Username"
          label="Username"
          error={errors.displayName}
          className="pl-10"
        />
        <User className="absolute left-3 top-9 h-5 w-5 text-gray-500" />
      </div>

      <div className="relative mt-4">
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          label="Email ID"
          error={errors.email}
          className="pl-10"
        />
        <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-500" />
      </div>

      <div className="relative mt-4">
        <Input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          label="Password"
          error={errors.password}
          className="pl-10"
        />
        <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-500" />
      </div>

      <div className="relative mt-4">
        <Input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          label="Location"
          error={errors.location}
          className="pl-10"
        />
        <MapPin className="absolute left-3 top-9 h-5 w-5 text-gray-500" />
      </div>

      <div className="relative mt-4">
        <Input
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          label="Phone Number"
          error={errors.phoneNumber}
          className="pl-10"
        />
        <Phone className="absolute left-3 top-9 h-5 w-5 text-gray-500" />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Profile Picture</label>
        <label className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-500 cursor-pointer transition">
          <Image className="mr-2 h-4 w-4" />
          Choose File
          <input
            type="file"
            name="profilePic"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </label>
        {formData.profilePic && (
          <p className="text-gray-400 mt-2 text-sm">{formData.profilePic.name}</p>
        )}
      </div>
    </>
  );

  const renderOtpSection = () => (
    <div className="space-y-4">
      <h3 className="text-gray-300 text-center">Enter the verification code sent to your email</h3>
      <OtpInput
        value={otp}
        valueLength={6}
        onChange={(val) => setOtp(val)}
      />
      <Button onClick={handleVerifyOtp} className="w-full mt-4" isLoading={isLoading}>
        Verify OTP
      </Button>
      <p className="text-sm text-gray-400 text-center">
        Didn't receive the code?{' '}
        <button className="text-indigo-400 hover:text-indigo-300 underline" onClick={handleSignup}>
          Resend
        </button>
      </p>
    </div>
  );

  const renderCompletedSection = () => (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
        <Check className="h-8 w-8 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-100">Account created successfully!</h3>
      <p className="text-gray-400 text-center mt-2">Redirecting to login...</p>
    </div>
  );

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8 animate-pulse">
        <h1 className="text-3xl font-extrabold text-indigo-400 tracking-wide">ECOFINDS</h1>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-gray-700 bg-[#0f172a] mb-4">
          <User className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
        {formStage === 'initial' && (
          <p className="text-gray-400 mt-2">Fill in your details to get started</p>
        )}
      </div>

      <div className="bg-[#0f172a] p-8 rounded-xl backdrop-blur-sm">
        {errors.general && <p className="text-red-500 text-sm mb-4 text-center">{errors.general}</p>}

        {formStage === 'initial' && (
          <>
            {renderFormFields()}
            <div className="mt-6 space-y-4">
              <Button fullWidth onClick={handleSignup} isLoading={isLoading}>
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </Button>
              <p className="text-sm text-center text-gray-400 mt-4">
                Already have an account?{' '}
                <Link to="/" className="text-indigo-400 hover:text-indigo-300">
                  Log in
                </Link>
              </p>
            </div>
          </>
        )}

        {formStage === 'otp' && renderOtpSection()}
        {formStage === 'completed' && renderCompletedSection()}
      </div>
    </div>
  );
};

export default SignUpForm;