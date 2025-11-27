import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-8 border border-stone-100 dark:border-stone-700">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-teal-600 rounded-xl text-white mb-4"><Activity size={32} /></div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Welcome Back</h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2">Sign in to manage your bookings</p>
        </div>
        {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-lg mb-4 text-sm font-bold">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-600 dark:text-stone-300 mb-1">Email</label>
            <input type="email" required className="w-full p-3 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 dark:text-white outline-none focus:ring-2 focus:ring-teal-500" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-600 dark:text-stone-300 mb-1">Password</label>
            <input type="password" required className="w-full p-3 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 dark:text-white outline-none focus:ring-2 focus:ring-teal-500" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button disabled={loading} type="submit" className="w-full py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-xl hover:opacity-90 transition-opacity">{loading ? 'Logging in...' : 'Log In'}</button>
        </form>
        <div className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">Need an account? <Link to="/register" className="text-teal-600 font-bold hover:underline">Sign Up</Link></div>
      </div>
    </div>
  );
};

export default Login;