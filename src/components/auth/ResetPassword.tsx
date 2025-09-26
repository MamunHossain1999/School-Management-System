/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../../store/api/authApi';

interface FormValues { password: string; confirmPassword: string }

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [done, setDone] = useState(false);

  const onSubmit = async ({ password }: FormValues) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }
    try {
      const res = await resetPassword({ token, password }).unwrap();
      toast.success(res.message || 'Password reset successful');
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reset password');
    }
  };

  const password = watch('password');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-900 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl shadow-lg mb-3">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-gray-300 mt-1">Enter your new password below.</p>
        </div>

        {done ? (
          <div className="bg-green-500/10 border border-green-500/30 text-green-200 p-4 rounded-xl text-sm flex items-center gap-2">
            <Check className="w-5 h-5" />
            Password has been reset. Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-200 mb-2">New Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                placeholder="Enter new password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-200 mb-2">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword', { required: 'Please confirm your password', validate: (v) => v === password || 'Passwords do not match' })}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
