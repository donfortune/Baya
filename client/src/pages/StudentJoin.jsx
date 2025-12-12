import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const StudentJoin = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const cleanCode = code.trim().toUpperCase();

    try {
      // 1. Verify room exists
      const res = await axios.get(`http://localhost:3000/api/polls/room/${cleanCode}`);
      
      // 2. If valid, enter the room
      if (res.data) {
        navigate(`/room/${cleanCode}`);
      }
    } catch (error) {
      toast.error("Room not found! Check the code.");
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

        <div className="glass p-8 rounded-3xl text-center">
          <h2 className="text-2xl font-bold mb-2">Join Session</h2>
          <p className="text-sm text-gray-400 mb-8">Enter the 4-character code on the screen.</p>
          
          <form onSubmit={handleJoin}>
            <input 
              required 
              maxLength="6"
              className="w-full bg-black/30 border border-white/10 rounded-2xl p-6 text-center text-3xl font-mono font-bold uppercase text-white outline-none mb-6 tracking-widest placeholder-gray-700 focus:border-blue-500 transition" 
              placeholder="X9Y2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-white text-black w-full py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Enter Session'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentJoin;