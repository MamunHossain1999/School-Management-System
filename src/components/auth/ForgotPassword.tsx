/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '../../store/api/authApi';

interface FormValues { email: string }

const ForgotPassword: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async ({ email }: FormValues) => {
    try {
      const res = await forgotPassword({ email }).unwrap();
      toast.success(res.message || 'Password reset email sent');
      setEmailSentTo(email);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-900 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl shadow-lg mb-3">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-gray-300 mt-1">Enter your email to receive a reset link.</p>
        </div>

        {emailSentTo ? (
          <div className="bg-green-500/10 border border-green-500/30 text-green-200 p-4 rounded-xl text-sm">
            We sent a password reset link to <span className="font-semibold">{emailSentTo}</span>. Please check your inbox and follow the instructions.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-200 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
