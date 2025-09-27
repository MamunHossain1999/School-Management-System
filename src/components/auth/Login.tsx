/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff, School, Lock, Mail, Users, BookOpen, GraduationCap, Heart, Sparkles, Shield, Zap } from "lucide-react";
import type { RootState } from "../../store";
import type { AppDispatch } from "../../store";
import { clearError, setToken, setUser, setRefreshToken, setLoading } from "../../store/slices/authSlice";
import { useLoginMutation } from "../../store/api/authApi";
import type { LoginCredentials } from "../../types";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<LoginCredentials>();
  const selectedRole = watch("role");
  const [login, { isLoading: isAuthLoading }] = useLoginMutation();

  useEffect(() => {
    console.log('🔍 Login useEffect triggered:', { isAuthenticated, user }); // Debug log
    if (isAuthenticated && user) {
      console.log('🚀 Navigating to dashboard for role:', user.role); // Debug log
      // Add a small delay to ensure state is fully updated
      setTimeout(() => {
        switch (user.role) {
          case "admin": 
            navigate("/admin/dashboard", { replace: true }); 
            break;
          case "teacher": 
            navigate("/teacher/dashboard", { replace: true }); 
            break;
          case "student": 
            navigate("/student/dashboard", { replace: true }); 
            break;
          case "parent": 
            navigate("/parent/dashboard", { replace: true }); 
            break;
          default: 
            navigate("/", { replace: true }); 
        }
      }, 100);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data: LoginCredentials) => {
    try {
      dispatch(setLoading(true));
      const res = await login({ email: data.email, password: data.password, role: data.role } as any).unwrap();
      if (res?.user) {
        if (res.token) dispatch(setToken(res.token));
        if ((res as any).refreshToken) dispatch(setRefreshToken((res as any).refreshToken as any));
        dispatch(setUser(res.user));
        toast.success('Login successful!');
      } else {
        toast.error('Login failed');
      }
    } catch (error: any) {
      const msg = error?.normalizedMessage || error?.data?.message || error?.message || 'Login failed';
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const demoCredentials = {
    admin: { email: "mamun@gmail.com", password: "mamun123" },
    teacher: { email: "masud@gmail.com", password: "mamun123" },
    student: { email: "siya@gmail.com", password: "mamun123" },
    parent: { email: "ismaile@gmail.com", password: "mamun123" },
  };

  const roleIcons = { admin: Users, teacher: BookOpen, student: GraduationCap, parent: Heart };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-900 px-4">
      {/* Glass Card */}
      <div className="relative w-full max-w-4xl bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl grid lg:grid-cols-2 overflow-hidden">
        
        {/* Left Side - Info */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-b from-purple-700 via-indigo-800 to-purple-900 text-white space-y-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <span className="font-semibold text-lg">Welcome to EduCare</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-snug">
            Sign in to your <span className="text-purple-300">Dashboard</span>
          </h1>
          <p className="text-gray-300 max-w-sm">
            Access your personalized education management system with powerful tools and insights.
          </p>
          <div className="grid grid-cols-1 gap-4">
            {[{ icon: Shield, text: "Secure Access", desc: "Protected login" },
              { icon: Zap, text: "Fast Performance", desc: "Lightning speed" },
              { icon: Users, text: "Multi-Role Support", desc: "All user types" }].map(({ icon: Icon, text, desc }) => (
              <div key={text} className="flex items-start gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                <Icon className="w-7 h-7 text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{text}</h3>
                  <p className="text-gray-300 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl shadow-lg mb-4">
              <School className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 mt-1">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2 text-center">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                {(["admin", "teacher", "student", "parent"] as const).map(role => {
                  const IconComponent = roleIcons[role];
                  return (
                    <label key={role} className="relative cursor-pointer group">
                      <input type="radio" value={role} {...register("role", { required: "Please select a role" })} className="sr-only" />
                      <div className={`p-4 rounded-xl flex flex-col items-center justify-center border transition-all ${selectedRole === role ? "border-purple-400 bg-purple-700/20 text-white shadow-md" : "border-white/20 hover:border-purple-400/50 hover:bg-white/5 text-gray-300"}`}>
                        <IconComponent className="w-6 h-6 mb-2" />
                        <span className="text-sm capitalize">{role}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.role && <p className="text-red-400 text-sm mt-2 text-center">{errors.role.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-200 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" } })}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-200 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
            </div>

            {/* Demo Credentials */}
            {selectedRole && (
              <div className="bg-purple-800/20 border border-purple-500/30 rounded-xl p-4 text-sm text-gray-300">
                <p className="font-semibold mb-1">Demo Credentials for {selectedRole}:</p>
                <p><span className="text-purple-300">Email:</span> {demoCredentials[selectedRole].email}</p>
                <p><span className="text-purple-300">Password:</span> {demoCredentials[selectedRole].password}</p>
                <button
                  type="button"
                  onClick={() => { setValue('email', demoCredentials[selectedRole].email as any); setValue('password', demoCredentials[selectedRole].password as any); }}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  Autofill
                </button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isLoading || isAuthLoading} className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all disabled:opacity-50">
              {isLoading || isAuthLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-gray-400">
              New to EduCare? <Link to="/register" className="text-purple-400 hover:underline">Create Account</Link>
            </p>
            <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">Forgot your password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
