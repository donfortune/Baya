// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FaArrowRight } from 'react-icons/fa';

// const Login = () => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // 1. Send Login Request
//       // URL matches your server structure: /api + /users/login
//       const url = 'http://localhost:3000/api/users/login';
      
//       const res = await axios.post(url, formData);
//       console.log("✅ Server Response:", res.data);

//       // 2. Extract Data
//       const token = res.data.token;

//       // CRITICAL: We need the _id to fetch polls later
//       // We explicitly look for _id in the flat response
//       const userToSave = {
//         name: res.data.name,
//         email: res.data.email,
//         _id: res.data._id || res.data.id // Look for _id first, then id
//       };

//       // 3. Validation Checks
//       if (!token) {
//         throw new Error("Login succeeded but no token was received.");
//       }

//       if (!userToSave._id) {
//          // This warning helps you know if the Backend is still not sending the ID
//          console.warn("⚠️ WARNING: Backend did not send an _id. Dashboard history might be empty.");
//          // We don't block login, but we warn the user
//          toast.warning("System Notice: User ID missing. History may not load.");
//       }

//       // 4. Save to Storage
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(userToSave));
      
//       // 5. Success Message
//       toast.success(`Welcome back, ${userToSave.name || 'User'}!`, { 
//         style: { background: '#ccff00', color: 'black', fontWeight: 'bold' },
//         progressStyle: { background: 'black' }
//       });
      
//       navigate('/dashboard');

//     } catch (err) {
//       console.error("Login Failed:", err);
      
//       if (err.response && err.response.status === 404) {
//         toast.error("Error 404: Check your server routes.");
//       } else {
//         const errorMsg = err.response?.data?.message || "Invalid Email or Password";
//         toast.error(errorMsg);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-4 relative overflow-hidden">
      
//       {/* 1. BACKGROUND GRID */}
//       <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      
//       {/* 2. GLOW SPOTLIGHT */}
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00] blur-[200px] opacity-5 pointer-events-none"></div>

//       {/* 3. LOGIN TERMINAL CARD */}
//       <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] border border-[#333] p-8 shadow-2xl rounded-xl">
        
//         {/* Header */}
//         <div className="mb-8">
//             <h2 className="text-3xl font-bold mb-2 text-white">Welcome back</h2>
//             <p className="text-gray-400 text-sm">Enter your details to access your dashboard.</p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Email</label>
//             <input 
//               type="email" 
//               required
//               className="w-full bg-[#1a1a1a] border border-[#333] text-white p-3 rounded-lg focus:outline-none focus:border-[#ccff00] transition-colors"
//               placeholder="name@example.com"
//               value={formData.email}
//               onChange={(e) => setFormData({...formData, email: e.target.value})}
//             />
//           </div>

//           <div>
//             <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Password</label>
//             <input 
//               type="password" 
//               required
//               className="w-full bg-[#1a1a1a] border border-[#333] text-white p-3 rounded-lg focus:outline-none focus:border-[#ccff00] transition-colors"
//               placeholder="••••••••"
//               value={formData.password}
//               onChange={(e) => setFormData({...formData, password: e.target.value})}
//             />
//           </div>

//           <button 
//             type="submit" 
//             disabled={loading}
//             className="w-full bg-[#ccff00] hover:bg-white text-black py-3 rounded-lg font-bold uppercase tracking-wide transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
//           >
//             {loading ? 'Authenticating...' : 'Log In'} <FaArrowRight />
//           </button>
//         </form>

//         <div className="mt-6 pt-6 border-t border-[#222] text-center">
//             <p className="text-gray-500 text-sm">
//                 Don't have an account? <Link to="/register" className="text-[#ccff00] hover:underline">Sign up</Link>
//             </p>
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
import { GoogleLogin } from '@react-oauth/google'; // 👈 Import Google Login

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- 1. EXISTING EMAIL LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = 'http://localhost:3000/api/users/login'; 
      const res = await axios.post(url, formData);
      handleLoginSuccess(res.data); // Refactored success logic to reuse it
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

  // --- 2. NEW GOOGLE LOGIN ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      // Send the Google token to YOUR backend
      // Note: Make sure this route exists in your backend (see previous step)
      const url = 'http://localhost:3000/api/users/google'; 
      
      const res = await axios.post(url, {
        token: credentialResponse.credential
      });

      console.log("✅ Google Auth Success:", res.data);
      handleLoginSuccess(res.data); // Reuse the same success logic

    } catch (err) {
      console.error("Google Login Failed:", err);
      toast.error("Google Sign-In failed on server.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SHARED SUCCESS HANDLER ---
  // This ensures both Email and Google login treat the user data exactly the same
  const handleLoginSuccess = (data) => {
      const token = data.token;

      // CRITICAL: We need the _id to fetch polls later
      const userToSave = {
        name: data.name || data.user?.name, // Handle different structure if needed
        email: data.email || data.user?.email,
        _id: data._id || data.id || data.user?._id // Look deep for the ID
      };

      if (!token) {
        toast.error("Login succeeded but no token was received.");
        return;
      }

      if (!userToSave._id) {
         console.warn("⚠️ WARNING: Backend did not send an _id.");
         toast.warning("System Notice: User ID missing. History may not load.");
      }

      // Save to Storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userToSave));
      
      // Success Message
      toast.success(`Welcome back, ${userToSave.name || 'User'}!`, { 
        style: { background: '#ccff00', color: 'black', fontWeight: 'bold' },
        progressStyle: { background: 'black' }
      });
      
      navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      
      {/* GLOW SPOTLIGHT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00] blur-[200px] opacity-5 pointer-events-none"></div>

      {/* LOGIN TERMINAL CARD */}
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

        {/* 👇 DIVIDER & GOOGLE BUTTON */}
        <div className="my-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-[#333] lg:w-1/4"></span>
          <span className="text-xs text-gray-500 uppercase">or continue with</span>
          <span className="w-1/5 border-b border-[#333] lg:w-1/4"></span>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            theme="filled_black" // Matches your dark theme better
            shape="rectangular"
            width="320" // Makes it wide enough to look good
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Google Login Failed');
              toast.error("Google Sign-In was unsuccessful");
            }}
          />
        </div>

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