import React, { useState } from 'react';
import axios from 'axios'; // ✅ 1. Import axios
import { User, Mail, Lock, Check } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import OtpInput from './OtpInput';

const initialFormData = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const SignUpForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [formStage, setFormStage] = useState('initial');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // ✅ 2. Call your backend to send OTP
      const response = await axios.post('/api/send-otp', {
        email: formData.email,
        displayName: formData.displayName,
      });

      if (response.data.success) {
        setOtpSent(true);
        setFormStage('otp');
      } else {
        alert(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      alert('Error sending OTP. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    setIsLoading(true);

    try {
      // ✅ 3. Call your backend to verify OTP and register user
      const response = await axios.post('/api/verify-otp', {
        otp,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
      });

      if (response.data.success) {
        setFormStage('completed');
      } else {
        alert(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      alert('Error verifying OTP. Try again.');
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
          placeholder="Display Name"
          label="Display Name"
          error={errors.displayName}
          className="pl-10"
        />
        <User className="absolute left-3 top-9 h-5 w-5 text-gray-500" />
      </div>

      <div className="relative">
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          label="Email"
          error={errors.email}
          className="pl-10"
        />
        <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-500" />
      </div>

      <div className="relative">
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

      <div className="relative">
        <Input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          label="Confirm Password"
          error={errors.confirmPassword}
          className="pl-10"
        />
        <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-500" />
      </div>
    </>
  );

  const renderOtpSection = () => (
    <div className="space-y-4">
      <h3 className="text-gray-300 text-center">Enter the verification code sent to your email</h3>
      <OtpInput 
        length={6} 
        onComplete={handleVerifyOtp} 
        disabled={isLoading} 
        onInvalid={() => console.log('Invalid OTP input')}
      />
      <p className="text-sm text-gray-400 text-center">
        Didn't receive the code? <button className="text-indigo-400 hover:text-indigo-300 underline" onClick={handleSendOtp}>Resend</button>
      </p>
    </div>
  );

  const renderCompletedSection = () => (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
        <Check className="h-8 w-8 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-100">Account created successfully!</h3>
      <p className="text-gray-400 text-center mt-2">
        You can now proceed to login with your credentials.
      </p>
      <Button
        variant="primary"
        className="mt-6"
        onClick={() => window.location.reload()}
      >
        Go to Login
      </Button>
    </div>
  );

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-gray-700 bg-gray-800/50 mb-4">
          <User className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
        {formStage === 'initial' && (
          <p className="text-gray-400 mt-2">Fill in your details to get started</p>
        )}
      </div>

      <div className="bg-gray-900/40 backdrop-blur-lg border border-gray-800 rounded-xl shadow-2xl p-8">
        {formStage === 'initial' && (
          <>
            {renderFormFields()}
            <div className="mt-6 space-y-4">
              <Button
                fullWidth
                onClick={handleSendOtp}
                isLoading={isLoading}
              >
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </Button>
              <p className="text-sm text-center text-gray-400">
                Already have an account?{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                  Sign in
                </a>
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
