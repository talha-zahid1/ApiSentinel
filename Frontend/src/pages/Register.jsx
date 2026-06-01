import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when editing field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const result = await register(
      formData.username.trim(),
      formData.email.trim(),
      formData.password
    );
    setLoading(false);

    if (result.success) {
      toast.success('Registration successful! Welcome aboard.');
      navigate('/');
    } else {
      toast.error(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[80px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-600/10 blur-[90px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md animate-scale-up">
        {/* App Title header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-xl text-primary-foreground select-none shadow-lg shadow-primary/20 glow-indigo">
            A
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 uppercase">Create your Account</h1>
          <p className="text-xs text-zinc-400 text-center">Get started with ApiSentinel API Key Manager</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. talha"
              error={errors.username}
              disabled={loading}
              autoComplete="username"
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="talha@example.com"
              error={errors.email}
              disabled={loading}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              disabled={loading}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              loading={loading}
            >
              Sign Up
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border flex justify-center text-xs text-zinc-400">
            <span>Already have an account?</span>
            <Link to="/login" className="ml-1 text-primary hover:text-indigo-400 font-semibold transition-colors">
              Log In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
