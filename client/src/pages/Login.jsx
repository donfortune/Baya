// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await axios.post('http://localhost:3000/api/users/login', { email, password });
      
//       // Save user data
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('user', JSON.stringify(res.data));
      
//       toast.success(`Welcome back, ${res.data.name}!`);
//       navigate('/dashboard');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Login failed');
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
//           <h2 className="text-2xl font-bold mb-6 text-center">Host Login</h2>
          
//           <form onSubmit={handleLogin}>
//             <div className="mb-4">
//               <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
//               <input 
//                 type="email" 
//                 required 
//                 className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 mt-1 transition"
//                 placeholder="host@baya.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
            
//             <div className="mb-6">
//               <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
//               <input 
//                 type="password" 
//                 required 
//                 className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 mt-1 transition"
//                 placeholder="••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             <button 
//               type="submit" 
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition transform active:scale-95 disabled:opacity-50"
//             >
//               {loading ? 'Logging in...' : 'Login'}
//             </button>
//           </form>

//           <p className="text-center text-sm text-gray-400 mt-6">
//             New here? <Link to="/register" className="text-blue-400 font-bold hover:underline">Create Account</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowRight } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Send Login Request
      // URL matches your server structure: /api + /users/login
      const url = 'http://localhost:3000/api/users/login';
      
      const res = await axios.post(url, formData);
      console.log("✅ Server Response:", res.data);

      // 2. Extract Data
      const token = res.data.token;

      // CRITICAL: We need the _id to fetch polls later
      // We explicitly look for _id in the flat response
      const userToSave = {
        name: res.data.name,
        email: res.data.email,
        _id: res.data._id || res.data.id // Look for _id first, then id
      };

      // 3. Validation Checks
      if (!token) {
        throw new Error("Login succeeded but no token was received.");
      }

      if (!userToSave._id) {
         // This warning helps you know if the Backend is still not sending the ID
         console.warn("⚠️ WARNING: Backend did not send an _id. Dashboard history might be empty.");
         // We don't block login, but we warn the user
         toast.warning("System Notice: User ID missing. History may not load.");
      }

      // 4. Save to Storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userToSave));
      
      // 5. Success Message
      toast.success(`Welcome back, ${userToSave.name || 'User'}!`, { 
        style: { background: '#ccff00', color: 'black', fontWeight: 'bold' },
        progressStyle: { background: 'black' }
      });
      
      navigate('/dashboard');

    } catch (err) {
      console.error("Login Failed:", err);
      
      if (err.response && err.response.status === 404) {
        toast.error("Error 404: Check your server routes.");
      } else {
        const errorMsg = err.response?.data?.message || "Invalid Email or Password";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 1. BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      
      {/* 2. GLOW SPOTLIGHT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00] blur-[200px] opacity-5 pointer-events-none"></div>

      {/* 3. LOGIN TERMINAL CARD */}
      <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] border border-[#333] p-8 shadow-2xl rounded-xl">
        
        {/* Header */}
        <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white">Welcome back</h2>
            <p className="text-gray-400 text-sm">Enter your details to access your dashboard.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#ccff00] hover:bg-white text-black py-3 rounded-lg font-bold uppercase tracking-wide transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Log In'} <FaArrowRight />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#222] text-center">
            <p className="text-gray-500 text-sm">
                Don't have an account? <Link to="/register" className="text-[#ccff00] hover:underline">Sign up</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;