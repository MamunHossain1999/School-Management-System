/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Eye, EyeOff, School, Lock, Mail, Phone, MapPin, Calendar, BookOpen, Users, GraduationCap, Heart, Shield, Zap, Rocket 
} from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { registerUser, clearError } from '../../store/slices/authSlice';
import type { RegisterData } from '../../types';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterData>();
  const selectedRole = watch('role');
  const password = watch('password');

  const roleIcons = {
    admin: Users,
    teacher: BookOpen,
    student: GraduationCap,
    parent: Heart,
  };

  const roleDescriptions = {
    admin: "Manage school operations",
    teacher: "Educate and inspire students", 
    student: "Learn and grow academically",
    parent: "Support your child's journey"
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data as any, dispatch);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Subtle Floating Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Hero Section */}
          <div className="text-white space-y-8 text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Rocket className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium">Join EduCare Today</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent leading-tight">
                Start Your
                <span className="block text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                  Educational Journey
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Create your account and unlock access to comprehensive educational management tools designed for modern learning.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {[ 
                { icon: Shield, text: "Secure Registration", desc: "Protected signup" },
                { icon: Zap, text: "Quick Setup", desc: "Get started fast" },
                { icon: Users, text: "Multi-Role Platform", desc: "For everyone" },
              ].map(({ icon: Icon, text, desc }) => (
                <div key={text} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 group">
                  <Icon className="h-8 w-8 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-1">{text}</h3>
                  <p className="text-sm text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Form Section */}
          <div className="w-full max-w-2xl mx-auto lg:mx-0 order-1 lg:order-2">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/20 transition-shadow duration-500">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                  <School className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-gray-300">Join thousands of educators worldwide</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-4 text-center">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['admin', 'teacher', 'student', 'parent'] as const).map((role) => {
                      const IconComponent = roleIcons[role];
                      return (
                        <label key={role} className="relative group cursor-pointer">
                          <input
                            type="radio"
                            value={role}
                            {...register('role', { required: 'Please select a role' })}
                            className="sr-only"
                          />
                          <div
                            className={`p-4 rounded-xl border transition-all duration-300 text-center transform hover:scale-105 ${
                              selectedRole === role
                                ? 'border-indigo-400 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-white shadow-lg shadow-indigo-500/25'
                                : 'border-white/20 hover:border-indigo-400/50 hover:bg-white/5 text-gray-300'
                            }`}
                          >
                            <IconComponent className="h-6 w-6 mx-auto mb-2" />
                            <span className="text-sm font-medium capitalize block">{role}</span>
                            <span className="text-xs opacity-75 block mt-1">{roleDescriptions[role]}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mr-2 text-xs">!</span>
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['firstName','lastName'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        {field === 'firstName' ? 'First Name' : 'Last Name'}
                      </label>
                      <div className="relative group">
                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                          type="text"
                          {...register(field as 'firstName' | 'lastName', { required: `${field === 'firstName' ? 'First' : 'Last'} name is required` })}
                          placeholder={`Enter ${field === 'firstName' ? 'first' : 'last'} name`}
                          className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-white placeholder-gray-400 transition-all backdrop-blur-sm"
                        />
                      </div>
                      {errors[field as 'firstName' | 'lastName'] && (
                        <p className="mt-2 text-sm text-red-400 flex items-center">
                          <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mr-2 text-xs">!</span>
                          {errors[field as 'firstName' | 'lastName']?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="Enter your email address"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-white placeholder-gray-400 transition-all backdrop-blur-sm"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mr-2 text-xs">!</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['password','confirmPassword'].map((field) => {
                    const isPasswordField = field === 'password';
                    const showField = isPasswordField ? showPassword : showConfirmPassword;
                    const toggleShow = isPasswordField ? () => setShowPassword(!showPassword) : () => setShowConfirmPassword(!showConfirmPassword);
                    return (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          {isPasswordField ? 'Password' : 'Confirm Password'}
                        </label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                          <input
                            type={showField ? 'text' : 'password'}
                            {...register(field as 'password' | 'confirmPassword', isPasswordField ? { 
                              required: 'Password is required',
                              minLength: { value: 6, message: 'Password must be at least 6 characters' }
                            } : { 
                              required: 'Please confirm your password',
                              validate: (val) => val === password || 'Passwords do not match'
                            })}
                            placeholder={isPasswordField ? 'Create password' : 'Confirm password'}
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-white placeholder-gray-400 transition-all backdrop-blur-sm"
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors"
                            onClick={toggleShow}
                          >
                            {showField ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors[field as 'password' | 'confirmPassword'] && (
                          <p className="mt-2 text-sm text-red-400 flex items-center">
                            <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mr-2 text-xs">!</span>
                            {errors[field as 'password' | 'confirmPassword']?.message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Phone Number (Optional)</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="tel"
                        {...register('phone')}
                        placeholder="Enter phone number"
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-white placeholder-gray-400 transition-all backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Date of Birth (Optional)</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="date"
                        {...register('dateOfBirth')}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-white transition-all backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Address (Optional)</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                    <textarea
                      {...register('address')}
                      rows={3}
                      placeholder="Enter your address"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-white placeholder-gray-400 transition-all backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/30 backdrop-blur-sm">
                  <input
                    type="checkbox"
                    {...register('terms', { required: 'Please accept the terms and conditions' })}
                    className="mt-1 h-5 w-5 text-indigo-600 border-2 border-indigo-300 rounded focus:ring-indigo-500 bg-white/10"
                  />
                  <div className="text-sm">
                    <label className="text-gray-200">
                      I agree to the{' '}
                      <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                        Privacy Policy
                      </Link>
                    </label>
                    {errors.terms && (
                      <p className="mt-1 text-red-400 flex items-center">
                        <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mr-2 text-xs">!</span>
                        {errors.terms.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>

                {/* Footer */}
                <p className="text-center text-gray-300 mt-4 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
                    Login
                  </Link>
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
