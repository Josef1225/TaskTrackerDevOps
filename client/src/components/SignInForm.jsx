'use client';

import { useState } from 'react';

export default function SignInForm({ onSignIn, switchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await onSignIn({ email, password });

    if (!result.success) {
      setError(result.error || 'Failed to sign in');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-md backdrop-blur-sm bg-opacity-90">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-blue-700 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-600 mt-2">Sign in to continue to your tasks</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 border border-rose-200 text-center animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative group">
            <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-300 group-hover:border-gray-300"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-medium ml-1">
                Password
              </label>
              
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-300 group-hover:border-gray-300"
              required
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="remember" className="text-sm text-gray-700">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-gray-500 text-sm">New here?</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Switch to Sign Up */}
        <div className="text-center">
          <button
            onClick={switchToSignUp}
            className="px-6 py-3 rounded-xl font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-2 border-indigo-100 transition-all duration-300 hover:border-indigo-200 w-full group"
          >
            <span className="flex items-center justify-center gap-2">
              Create New Account
              <svg 
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}