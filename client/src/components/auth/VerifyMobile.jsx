import React, { useState } from 'react';
import axios from 'axios';
import Input from '../ui/Input';
import Button from '../ui/Button';
import OtpInput from './OtpInput';
import Dashboard from '../dashboard/Dashboard';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyMobile = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('input'); // 'input' or 'otp'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // retrieve email passed from previous step

  const handleSendMobileOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
   
    try {
     
   
      
      const res = await axios.post('http://localhost:8080/api/v1/auth/send-mobile-otp', {
        email, // associate with email
        mobile
      });
      if (res.data.success) {
        setStage('otp');
        setError('');
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
      
  };

  const handleVerifyMobileOtp = async () => {
   
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/v1/auth/verify-mobile-otp', {//URL OTP
        email,
        mobile,
        otp
      });
      if (res.data.success) {
        navigate('/dashboard'); // or wherever you want to redirect after full registration
      } else {
        setError(res.data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
      
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-900/40 p-8 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Verify Your Mobile Number</h2>
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      {stage === 'input' ? (
        <>
          <Input
            name="mobile"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            placeholder="Mobile Number"
            label="Mobile Number"
            className="mb-6"
          />
          <Button onClick={handleSendMobileOtp} isLoading={isLoading} fullWidth>
            Send OTP
          </Button>
        </>
      ) : (
        <>
          <OtpInput
            value={otp}
            valueLength={6}
            onChange={setOtp}
          />
          <Button onClick={handleVerifyMobileOtp} isLoading={isLoading} className="w-full mt-4">
            Verify OTP
          </Button>
          <p className="text-sm text-gray-400 text-center mt-2">
            Didn't receive the code?{' '}
            <button className="text-indigo-400 hover:text-indigo-300 underline" onClick={handleSendMobileOtp}>Resend</button>
          </p>
        </>
      )}
    </div>
  );
};

export default VerifyMobile;
