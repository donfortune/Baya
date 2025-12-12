// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useSocket } from '../context/SocketContext';
// import { FaPlus, FaSignOutAlt, FaWind, FaFire, FaRegCopy } from 'react-icons/fa';

// // Components
// import CreatePollModal from '../components/CreatePollModal';
// import PollCard from '../components/PollCard';

// // Helper for API auth
// const getAuthHeaders = () => ({
//   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// });

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const socket = useSocket();
//   const user = JSON.parse(localStorage.getItem('user'));

//   // --- STATE ---
//   const [pollsList, setPollsList] = useState([]);
//   const [roomCode, setRoomCode] = useState(null);
//   const [confusionLevel, setConfusionLevel] = useState(0);
//   const [whispers, setWhispers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [reactions, setReactions] = useState([]); // NEW: Store floating emojis

//   // --- NAME FORMATTING ---
//   let displayName = "Host";
//   if (user && user.name) {
//     displayName = user.name.split(' ')[0].charAt(0).toUpperCase() + user.name.split(' ')[0].slice(1);
//   }

//   // --- INITIAL DATA FETCH ---
//   const fetchInitialData = async () => {
//     try {
//       const response = await axios.get('http://localhost:3000/api/polls/host', getAuthHeaders());
//       const polls = response.data || [];
      
//       if (polls.length > 0) {
//         const activeCode = polls[0].roomCode; 
//         setRoomCode(activeCode);
//         setPollsList(polls);
//         // Connect to room if socket is ready
//         if(socket) socket.emit('join_room', activeCode);
//       } else {
//         setRoomCode('NEW');
//       }
//     } catch (error) {
//       console.error("Dashboard Load Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- LOGOUT ---
//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     if(socket) socket.disconnect(); 
//     navigate('/login');
//   };

//   // --- SOCKETS & EFFECTS ---
//   useEffect(() => {
//     fetchInitialData();
//   }, []);
  
//   useEffect(() => {
//     if (socket && roomCode && roomCode !== 'NEW') {
//       // 1. Poll Updates
//       socket.on('poll_updated', (updatedPoll) => {
//         setPollsList(prev => {
//           const exists = prev.find(p => p.pollId === updatedPoll.pollId || p._id === updatedPoll._id);
//           if (exists) {
//             return prev.map(p => (p.pollId === updatedPoll.pollId || p._id === updatedPoll._id) ? updatedPoll : p);
//           }
//           return [updatedPoll, ...prev];
//         });
//       });

//       // 2. Panic Button
//       socket.on('panic_alert', () => {
//         setConfusionLevel(prev => Math.min(prev + 10, 100));
//       });

//       // 3. Whispers
//       socket.on('whisper_message', (data) => {
//         setWhispers(prev => [data.message, ...prev].slice(0, 5));
//       });

//       // 4. EMOJI REACTIONS (NEW)
//       socket.on('reaction_received', (data) => {
//         setReactions(prev => [...prev, data]);
//         // Auto-remove after animation (2s) to prevent memory leaks
//         setTimeout(() => {
//             setReactions(prev => prev.filter(r => r.id !== data.id));
//         }, 2000);
//       });
      
//       // 5. Decay Logic
//       const decayInterval = setInterval(() => {
//         setConfusionLevel(prev => Math.max(prev - 5, 0));
//       }, 2000);

//       return () => {
//         socket.off('poll_updated');
//         socket.off('panic_alert');
//         socket.off('whisper_message');
//         socket.off('reaction_received');
//         clearInterval(decayInterval);
//       };
//     }
//   }, [socket, roomCode]);

//   // --- RENDER ---
//   if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div></div>;

//   return (
//     <div className="w-full max-w-6xl mx-auto p-4 animate-slide-up pb-20 relative">
      
//       {/* HEADER SECTION */}
//       <div className="flex flex-col md:flex-row justify-between items-end mb-8 pt-8 gap-4">
//         <div>
//             <h2 className="text-4xl font-bold tracking-tight text-white mb-2">Hello, {displayName}</h2>
//             <div className="flex items-center gap-3 text-gray-400">
//               <span>Session Code:</span>
//               <button 
//                 onClick={() => {
//                   if(roomCode && roomCode !== 'NEW') {
//                     navigator.clipboard.writeText(roomCode);
//                     toast.success("Code Copied! 📋", { autoClose: 1000, hideProgressBar: true });
//                   }
//                 }}
//                 className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg font-mono text-xl text-blue-400 font-bold cursor-pointer transition flex items-center gap-3 group active:scale-95"
//                 title="Click to Copy"
//               >
//                 {roomCode || '...'}
//                 <span className="text-xs text-gray-500 group-hover:text-white transition">
//                   <FaRegCopy />
//                 </span>
//               </button>
//             </div>
//         </div>

//         <div className="flex gap-3">
//             <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 px-4 py-3 font-bold flex items-center gap-2 bg-white/5 rounded-xl border border-transparent hover:border-red-500/30 transition">
//               <FaSignOutAlt/> Log Out
//             </button>
//             <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-1">
//               <FaPlus /> New Poll
//             </button>
//         </div>
//       </div>

//       {/* LIVE SIGNALS ROW */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//           <div className="md:col-span-3 glass p-5 rounded-2xl border border-blue-500/30 overflow-hidden h-36 flex flex-col">
//               <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaWind /> Live Whispers</div>
//               <div className="flex flex-wrap gap-2 overflow-y-auto">
//                   {whispers.length === 0 && <span className="text-gray-600 text-sm italic">Silence in the room...</span>}
//                   {whispers.map((w, index) => (
//                       <span key={index} className="bg-blue-500/10 border border-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-sm animate-slide-up">{w}</span>
//                   ))}
//               </div>
//           </div>
          
//           <div className="md:col-span-1 glass p-5 rounded-2xl border border-red-500/30 h-36 flex flex-col justify-between relative overflow-hidden group">
//               <div className="text-xs font-bold text-red-400 uppercase tracking-widest z-10 flex items-center gap-2"><FaFire /> Panic Level</div>
//               <div className="text-5xl font-bold text-white z-10">{confusionLevel}%</div>
//               <div className="absolute bottom-0 left-0 h-2 w-full bg-gray-700">
//                 <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-500 ease-out" style={{ width: `${confusionLevel}%` }}></div>
//               </div>
//               <div className="absolute inset-0 bg-red-600 blur-3xl opacity-10 transition-opacity duration-500" style={{ opacity: confusionLevel / 200 }}></div>
//           </div>
//       </div>

//       {/* POLLS GRID */}
//       {pollsList.length === 0 ? (
//           <div className="glass p-16 rounded-3xl text-center border-dashed border-2 border-white/10 flex flex-col items-center">
//             <div className="text-6xl mb-6 opacity-50">📭</div>
//             <h3 className="text-2xl font-bold text-white mb-2">Start your session</h3>
//             <p className="text-gray-400 mb-8">Create your first question to wake up the class.</p>
//             <button onClick={() => setIsModalOpen(true)} className="text-blue-400 hover:text-blue-300 font-bold text-lg">Create Now →</button>
//           </div>
//       ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {pollsList.map(p => <PollCard key={p._id || p.pollId} poll={p} />)}
//           </div>
//       )}

//       {/* FLOATING EMOJI LAYER (NEW) */}
//       {/* This renders invisible containers that float up from the bottom right */}
//       <div className="fixed bottom-0 right-10 w-32 h-screen pointer-events-none z-50 overflow-hidden">
//         {reactions.map((r) => (
//             <div 
//                 key={r.id}
//                 className="absolute bottom-0 text-5xl animate-float-up opacity-0"
//                 style={{ 
//                     left: `${Math.random() * 60 + 20}%`, // Randomize horizontal position
//                     animationDuration: `${1.5 + Math.random()}s` // Randomize speed
//                 }}
//             >
//                 {r.emoji}
//             </div>
//         ))}
//       </div>

//       <CreatePollModal 
//         isOpen={isModalOpen} 
//         onClose={() => setIsModalOpen(false)} 
//         onCreated={(newPoll) => {
//             setPollsList(prev => [newPoll, ...prev]); 
//             if (!roomCode || roomCode === 'NEW') {
//                 setRoomCode(newPoll.roomCode);
//                 if(socket) socket.emit('join_room', newPoll.roomCode);
//             }
//         }}
//         roomCode={roomCode}
//       />

//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSocket } from '../context/SocketContext';
import { FaPlus, FaSignOutAlt, FaWind, FaFire, FaRegCopy } from 'react-icons/fa';

// Components
import CreatePollModal from '../components/CreatePollModal';
import PollCard from '../components/PollCard';

// Helper for API auth
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Dashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const user = JSON.parse(localStorage.getItem('user'));

  // --- STATE ---
  const [pollsList, setPollsList] = useState([]);
  const [roomCode, setRoomCode] = useState(null);
  const [confusionLevel, setConfusionLevel] = useState(0);
  const [whispers, setWhispers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reactions, setReactions] = useState([]); // Store floating emojis

  // --- NAME FORMATTING ---
  let displayName = "Host";
  if (user && user.name) {
    displayName = user.name.split(' ')[0].charAt(0).toUpperCase() + user.name.split(' ')[0].slice(1);
  }

  // --- INITIAL DATA FETCH ---
  const fetchInitialData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/polls/host', getAuthHeaders());
      const polls = response.data || [];
      
      if (polls.length > 0) {
        const activeCode = polls[0].roomCode; 
        setRoomCode(activeCode);
        setPollsList(polls);
        // Connect to room if socket is ready
        if(socket) socket.emit('join_room', activeCode);
      } else {
        setRoomCode('NEW');
      }
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if(socket) socket.disconnect(); 
    navigate('/login');
  };

  // --- SOCKETS & EFFECTS ---
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    if (socket && roomCode && roomCode !== 'NEW') {
      // 1. Poll Updates
      socket.on('poll_updated', (updatedPoll) => {
        setPollsList(prev => {
          const exists = prev.find(p => p.pollId === updatedPoll.pollId || p._id === updatedPoll._id);
          if (exists) {
            return prev.map(p => (p.pollId === updatedPoll.pollId || p._id === updatedPoll._id) ? updatedPoll : p);
          }
          return [updatedPoll, ...prev];
        });
      });

      // 2. Panic Button (Visual update only)
      socket.on('panic_alert', () => {
        setConfusionLevel(prev => Math.min(prev + 10, 100));
      });

      // 3. Whispers (Visual update only)
      socket.on('whisper_message', (data) => {
        setWhispers(prev => [data.message, ...prev].slice(0, 5));
      });

    //   // 4. EMOJI REACTIONS (Flying Animation)
    //   socket.on('reaction_received', (data) => {
    //     setReactions(prev => [...prev, data]);
    //     // Auto-remove after animation (2s) to prevent memory leaks
    //     setTimeout(() => {
    //         setReactions(prev => prev.filter(r => r.id !== data.id));
    //     }, 2000);
    //   });

      socket.on('reaction_received', (data) => {
        console.log("✨ EMOJI RECEIVED:", data.emoji); // Check your console for this!
        setReactions(prev => [...prev, data]);
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== data.id));
        }, 2000);
      });
      
      // 5. Decay Logic (Lowers panic level automatically)
      const decayInterval = setInterval(() => {
        setConfusionLevel(prev => Math.max(prev - 5, 0));
      }, 2000);

      return () => {
        socket.off('poll_updated');
        socket.off('panic_alert');
        socket.off('whisper_message');
        socket.off('reaction_received');
        clearInterval(decayInterval);
      };
    }
  }, [socket, roomCode]);

  // --- RENDER ---
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div></div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 animate-slide-up pb-20 relative">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 pt-8 gap-4">
        <div>
            <h2 className="text-4xl font-bold tracking-tight text-white mb-2">Hello, {displayName}</h2>
            <div className="flex items-center gap-3 text-gray-400">
              <span>Session Code:</span>
              <button 
                onClick={() => {
                  if(roomCode && roomCode !== 'NEW') {
                    navigator.clipboard.writeText(roomCode);
                    toast.success("Code Copied! 📋", { autoClose: 1000, hideProgressBar: true });
                  }
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg font-mono text-xl text-blue-400 font-bold cursor-pointer transition flex items-center gap-3 group active:scale-95"
                title="Click to Copy"
              >
                {roomCode || '...'}
                <span className="text-xs text-gray-500 group-hover:text-white transition">
                  <FaRegCopy />
                </span>
              </button>
            </div>
        </div>

        <div className="flex gap-3">
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 px-4 py-3 font-bold flex items-center gap-2 bg-white/5 rounded-xl border border-transparent hover:border-red-500/30 transition">
              <FaSignOutAlt/> Log Out
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-1">
              <FaPlus /> New Poll
            </button>
        </div>
      </div>

      {/* LIVE SIGNALS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Whispers Feed */}
          <div className="md:col-span-3 glass p-5 rounded-2xl border border-blue-500/30 overflow-hidden h-36 flex flex-col">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaWind /> Live Whispers</div>
              <div className="flex flex-wrap gap-2 overflow-y-auto">
                  {whispers.length === 0 && <span className="text-gray-600 text-sm italic">Silence in the room...</span>}
                  {whispers.map((w, index) => (
                      <span key={index} className="bg-blue-500/10 border border-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-sm animate-slide-up">{w}</span>
                  ))}
              </div>
          </div>
          
          {/* Confusion Meter */}
          <div className="md:col-span-1 glass p-5 rounded-2xl border border-red-500/30 h-36 flex flex-col justify-between relative overflow-hidden group">
              <div className="text-xs font-bold text-red-400 uppercase tracking-widest z-10 flex items-center gap-2"><FaFire /> Panic Level</div>
              <div className="text-5xl font-bold text-white z-10">{confusionLevel}%</div>
              
              {/* Animated Bar */}
              <div className="absolute bottom-0 left-0 h-2 w-full bg-gray-700">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-500 ease-out" style={{ width: `${confusionLevel}%` }}></div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-red-600 blur-3xl opacity-10 transition-opacity duration-500" style={{ opacity: confusionLevel / 200 }}></div>
          </div>
      </div>

      {/* POLLS GRID */}
      {pollsList.length === 0 ? (
          <div className="glass p-16 rounded-3xl text-center border-dashed border-2 border-white/10 flex flex-col items-center">
            <div className="text-6xl mb-6 opacity-50">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">Start your session</h3>
            <p className="text-gray-400 mb-8">Create your first question to wake up the class.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-blue-400 hover:text-blue-300 font-bold text-lg">Create Now →</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pollsList.map(p => <PollCard key={p._id || p.pollId} poll={p} />)}
          </div>
      )}

      {/* FLOATING EMOJI LAYER */}
      {/* Invisible container on the right side where emojis bubble up */}
      <div className="fixed bottom-0 right-10 w-32 h-screen pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => (
            <div 
                key={r.id}
                className="absolute bottom-0 text-5xl animate-float-up opacity-0"
                style={{ 
                    left: `${Math.random() * 60 + 20}%`, // Randomize horizontal position
                    animationDuration: `${1.5 + Math.random()}s` // Randomize speed
                }}
            >
                {r.emoji}
            </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      <CreatePollModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={(newPoll) => {
            // Optimistic Update: Add to list immediately
            setPollsList(prev => [newPoll, ...prev]); 
            
            // Connect to Room if first poll
            if (!roomCode || roomCode === 'NEW') {
                setRoomCode(newPoll.roomCode);
                if(socket) socket.emit('join_room', newPoll.roomCode);
            }
        }}
        roomCode={roomCode}
      />

    </div>
  );
};

export default Dashboard;