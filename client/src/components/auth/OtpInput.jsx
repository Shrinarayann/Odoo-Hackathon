import React, { useRef, useState, useEffect } from 'react';

const OtpInput = ({
  length = 6,
  onComplete,
  onInvalid,
  disabled = false,
}) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  // Initialize refs array based on length
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    // Only allow numerical input
    if (!/^\d*$/.test(value)) {
      if (onInvalid) onInvalid();
      return;
    }

    // Handle paste event with multiple digits
    if (value.length > 1) {
      const digits = value.split('').slice(0, length - index);
      const newOtp = [...otp];

      digits.forEach((digit, i) => {
        if (index + i < length) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);

      const focusIndex = Math.min(index + digits.length, length - 1);
      if (inputRefs.current[focusIndex]) inputRefs.current[focusIndex].focus();

      if (newOtp.every(digit => digit !== '')) {
        if (onComplete) onComplete(newOtp.join(''));
      }

      return;
    }

    // Single digit input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      if (inputRefs.current[index + 1]) inputRefs.current[index + 1].focus();
    }

    if (newOtp.every(digit => digit !== '')) {
      if (onComplete) onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if ((e.key === 'Backspace' || e.key === 'ArrowLeft') && index > 0 && !otp[index]) {
      if (inputRefs.current[index - 1]) inputRefs.current[index - 1].focus();
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      if (inputRefs.current[index + 1]) inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d*$/.test(pastedData)) {
      if (onInvalid) onInvalid();
      return;
    }
  };

  return (
    <div className="flex justify-center gap-2 my-4">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className="
            w-12 h-12 text-center text-xl font-semibold text-gray-200
            bg-gray-800/40 border border-gray-700 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
            transition-all duration-200 backdrop-blur-sm
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />
      ))}
    </div>
  );
};

export default OtpInput;
