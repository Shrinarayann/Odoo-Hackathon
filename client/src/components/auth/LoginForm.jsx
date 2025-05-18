import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
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
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-gray-700 bg-gray-800/50 mb-4">
          <User className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
        <p className="text-gray-400 mt-2">Sign in to your account</p>
      </div>

      <div className="bg-gray-900/40 backdrop-blur-lg border border-gray-800 rounded-xl shadow-2xl p-8">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email / Username"
              label="Email / Username"
              error={errors.email}
              className="pl-10"
            />
            <User className="absolute left-3 top-9 h-5 w-5 text-gray-500" />
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

          <div className="mt-6 space-y-4">
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
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