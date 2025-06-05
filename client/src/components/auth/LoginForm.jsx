import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.token) {
          localStorage.setItem('authToken', result.token);
          console.log('Token stored successfully');
        }

        if (result.user) {
          localStorage.setItem('userInfo', JSON.stringify(result.user));
        }

        console.log('Login successful');
        navigate('/dashboard');
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({
            general: result.error || result.message || 'Login failed. Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Centered Logo and App Name */}
      <div className="text-center mb-8 animate-pulse flex flex-col items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-30 w-35 sm:h-30 sm:w-40 transition-transform hover:scale-110"
            loading="lazy"
          />
        
      </div>

      <div className="bg-gray-900/40 backdrop-blur-lg border border-gray-800 rounded-xl shadow-2xl p-8">
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-200 text-sm">
              {errors.general}
            </div>
          )}

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
              required
            />
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
              required
            />
            <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-500" />
          </div>

          <div className="mt-6 space-y-4">
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={!formData.email || !formData.password}
            >
              Sign In
            </Button>

            <p className="text-sm text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;