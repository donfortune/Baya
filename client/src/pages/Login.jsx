import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/users/login', { email, password });
      
      // Save user data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-slide-up">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm transition">
          <i className="fa-solid fa-arrow-left"></i> Back
        </Link>
        
        <div className="glass p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Host Login</h2>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
              <input 
                type="email" 
                required 
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 mt-1 transition"
                placeholder="host@baya.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
              <input 
                type="password" 
                required 
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 mt-1 transition"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            New here? <Link to="/register" className="text-blue-400 font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;