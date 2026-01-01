// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const Register = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await axios.post('http://localhost:3000/api/users/register', { name, email, password });
      
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('user', JSON.stringify(res.data));
      
//       toast.success('Account created successfully!');
//       navigate('/dashboard');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-slide-up">
//       <div className="w-full max-w-sm">
//         <Link to="/" className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm transition">
//           <i className="fa-solid fa-arrow-left"></i> Back
//         </Link>
        
//         <div className="glass p-8 rounded-3xl">
//           <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
          
//           <form onSubmit={handleRegister}>
//             <div className="mb-4">
//               <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
//               <input type="text" required className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-green-500 mt-1 transition" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
//             </div>

//             <div className="mb-4">
//               <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
//               <input type="email" required className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-green-500 mt-1 transition" placeholder="host@baya.com" value={email} onChange={(e) => setEmail(e.target.value)} />
//             </div>
            
//             <div className="mb-6">
//               <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
//               <input type="password" required className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-green-500 mt-1 transition" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
//             </div>

//             <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition transform active:scale-95 disabled:opacity-50">
//               {loading ? 'Creating...' : 'Sign Up'}
//             </button>
//           </form>

//           <p className="text-center text-sm text-gray-400 mt-6">
//             Have an account? <Link to="/login" className="text-blue-400 font-bold hover:underline">Login</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBolt } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 👇 UPDATED ROUTE TO MATCH YOUR BACKEND
      await axios.post('http://localhost:3000/api/users/register', formData);
      
      toast.success("Account created! Please log in.", { 
        style: { background: '#ccff00', color: 'black', fontWeight: 'bold' },
        progressStyle: { background: 'black' }
      });
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* ... (Background elements stay the same) ... */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00] blur-[200px] opacity-5 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] border border-[#333] p-8 shadow-2xl rounded-xl">
        <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white">Create an account</h2>
            <p className="text-gray-400 text-sm">Get started with Baya for free.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-[#1a1a1a] border border-[#333] text-white p-3 rounded-lg focus:outline-none focus:border-[#ccff00] transition-colors"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#1a1a1a] border border-[#333] text-white p-3 rounded-lg focus:outline-none focus:border-[#ccff00] transition-colors"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#1a1a1a] border border-[#333] text-white p-3 rounded-lg focus:outline-none focus:border-[#ccff00] transition-colors"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#ccff00] hover:bg-white text-black py-3 rounded-lg font-bold uppercase tracking-wide transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Sign Up'} <FaBolt />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#222] text-center">
            <p className="text-gray-500 text-sm">
                Already have an account? <Link to="/login" className="text-[#ccff00] hover:underline">Log in</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register;