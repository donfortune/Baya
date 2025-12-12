import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/users/register', { name, email, password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
          <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
          
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
              <input type="text" required className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-green-500 mt-1 transition" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
              <input type="email" required className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-green-500 mt-1 transition" placeholder="host@baya.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
              <input type="password" required className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-green-500 mt-1 transition" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition transform active:scale-95 disabled:opacity-50">
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Have an account? <Link to="/login" className="text-blue-400 font-bold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;