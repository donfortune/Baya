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
//   const [reactions, setReactions] = useState([]); // Store floating emojis

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

//       // 2. Panic Button (Visual update only)
//       socket.on('panic_alert', () => {
//         setConfusionLevel(prev => Math.min(prev + 10, 100));
//       });

//       // 3. Whispers (Visual update only)
//       socket.on('whisper_message', (data) => {
//         setWhispers(prev => [data.message, ...prev].slice(0, 5));
//       });

//     //   // 4. EMOJI REACTIONS (Flying Animation)
//     //   socket.on('reaction_received', (data) => {
//     //     setReactions(prev => [...prev, data]);
//     //     // Auto-remove after animation (2s) to prevent memory leaks
//     //     setTimeout(() => {
//     //         setReactions(prev => prev.filter(r => r.id !== data.id));
//     //     }, 2000);
//     //   });

//       socket.on('reaction_received', (data) => {
//         console.log("✨ EMOJI RECEIVED:", data.emoji); // Check your console for this!
//         setReactions(prev => [...prev, data]);
//         setTimeout(() => {
//             setReactions(prev => prev.filter(r => r.id !== data.id));
//         }, 2000);
//       });
      
//       // 5. Decay Logic (Lowers panic level automatically)
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
//           {/* Whispers Feed */}
//           <div className="md:col-span-3 glass p-5 rounded-2xl border border-blue-500/30 overflow-hidden h-36 flex flex-col">
//               <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaWind /> Live Whispers</div>
//               <div className="flex flex-wrap gap-2 overflow-y-auto">
//                   {whispers.length === 0 && <span className="text-gray-600 text-sm italic">Silence in the room...</span>}
//                   {whispers.map((w, index) => (
//                       <span key={index} className="bg-blue-500/10 border border-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-sm animate-slide-up">{w}</span>
//                   ))}
//               </div>
//           </div>
          
//           {/* Confusion Meter */}
//           <div className="md:col-span-1 glass p-5 rounded-2xl border border-red-500/30 h-36 flex flex-col justify-between relative overflow-hidden group">
//               <div className="text-xs font-bold text-red-400 uppercase tracking-widest z-10 flex items-center gap-2"><FaFire /> Panic Level</div>
//               <div className="text-5xl font-bold text-white z-10">{confusionLevel}%</div>
              
//               {/* Animated Bar */}
//               <div className="absolute bottom-0 left-0 h-2 w-full bg-gray-700">
//                 <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-500 ease-out" style={{ width: `${confusionLevel}%` }}></div>
//               </div>
              
//               {/* Background Glow */}
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

//       {/* FLOATING EMOJI LAYER */}
//       {/* Invisible container on the right side where emojis bubble up */}
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

//       {/* CREATE MODAL */}
//       <CreatePollModal 
//         isOpen={isModalOpen} 
//         onClose={() => setIsModalOpen(false)} 
//         onCreated={(newPoll) => {
//             // Optimistic Update: Add to list immediately
//             setPollsList(prev => [newPoll, ...prev]); 
            
//             // Connect to Room if first poll
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

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useSocket } from '../context/SocketContext';
// import { FaPlus, FaSignOutAlt, FaWind, FaFire, FaRegCopy, FaGhost, FaTerminal } from 'react-icons/fa';

// // Components
// import CreatePollModal from '../components/CreatePollModal';
// import PollCard from '../components/PollCard'; // We will need to update this card style later too, but let's fix the layout first.

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
//   const [reactions, setReactions] = useState([]);

//   let displayName = "Host";
//   if (user && user.name) {
//     displayName = user.name.split(' ')[0].charAt(0).toUpperCase() + user.name.split(' ')[0].slice(1);
//   }

//   // --- FETCH & SOCKETS (Same Logic, New Style) ---
//   const fetchInitialData = async () => {
//     try {
//       const response = await axios.get('http://localhost:3000/api/polls/host', getAuthHeaders());
//       const polls = response.data || [];
//       if (polls.length > 0) {
//         const activeCode = polls[0].roomCode; 
//         setRoomCode(activeCode);
//         setPollsList(polls);
//         if(socket) socket.emit('join_room', activeCode);
//       } else {
//         setRoomCode('NEW');
//       }
//     } catch (error) {
//       console.error("Error", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     if(socket) socket.disconnect(); 
//     navigate('/login');
//   };

//   useEffect(() => {
//     fetchInitialData();
//   }, []);
  
//   useEffect(() => {
//     if (socket && roomCode && roomCode !== 'NEW') {
//       socket.emit('join_room', roomCode);

//       socket.on('poll_updated', (updatedPoll) => {
//         setPollsList(prev => {
//           const exists = prev.find(p => p.pollId === updatedPoll.pollId || p._id === updatedPoll._id);
//           if (exists) return prev.map(p => (p.pollId === updatedPoll.pollId || p._id === updatedPoll._id) ? updatedPoll : p);
//           return [updatedPoll, ...prev];
//         });
//       });

//       socket.on('panic_alert', () => setConfusionLevel(prev => Math.min(prev + 10, 100)));
//       socket.on('whisper_message', (data) => setWhispers(prev => [data.message, ...prev].slice(0, 5)));
//       socket.on('reaction_received', (data) => {
//         setReactions(prev => [...prev, data]);
//         setTimeout(() => setReactions(prev => prev.filter(r => r.id !== data.id)), 2000);
//       });
      
//       const decayInterval = setInterval(() => setConfusionLevel(prev => Math.max(prev - 5, 0)), 2000);

//       return () => {
//         socket.off('poll_updated');
//         socket.off('panic_alert');
//         socket.off('whisper_message');
//         socket.off('reaction_received');
//         clearInterval(decayInterval);
//       };
//     }
//   }, [socket, roomCode]);

//   if (loading) return <div className="flex h-screen items-center justify-center bg-[#030303]"><div className="text-[#ccff00] font-mono animate-pulse">LOADING_SYSTEM...</div></div>;

//   return (
//     <div className="w-full min-h-screen bg-[#030303] text-[#e0e0e0] p-6 pb-20 font-sans relative">
      
//       {/* NAVBAR */}
//       <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end mb-12 border-b border-[#333] pb-6 gap-6">
//         <div>
//             <div className="text-xs font-mono text-[#ccff00] mb-2 uppercase tracking-widest">/// HOST_TERMINAL_V1</div>
//             <h2 className="text-5xl font-black tracking-tighter text-white">HELLO, {displayName}</h2>
//         </div>

//         <div className="flex gap-4 items-center">
//              {/* ROOM CODE BADGE */}
//              <div className="flex flex-col items-end">
//                 <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Session Code</span>
//                 <button 
//                     onClick={() => {
//                         if(roomCode && roomCode !== 'NEW') {
//                             navigator.clipboard.writeText(roomCode);
//                             toast.success("COPIED TO CLIPBOARD", { 
//                                 style: { background: '#ccff00', color: 'black', fontWeight: 'bold' },
//                                 progressStyle: { background: 'black' }
//                             });
//                         }
//                     }}
//                     className="group bg-[#111] border border-[#333] hover:border-[#ccff00] px-6 py-2 flex items-center gap-3 transition-all cursor-pointer"
//                 >
//                     <span className="text-2xl font-mono font-bold text-white group-hover:text-[#ccff00]">{roomCode || '...'}</span>
//                     <FaRegCopy className="text-gray-500 group-hover:text-[#ccff00]" />
//                 </button>
//              </div>

//             <button onClick={handleLogout} className="h-14 px-6 border border-[#333] hover:bg-red-900/20 hover:border-red-500 hover:text-red-500 text-gray-400 font-bold transition flex items-center gap-2">
//               <FaSignOutAlt/>
//             </button>
//             <button onClick={() => setIsModalOpen(true)} className="h-14 bg-[#ccff00] hover:bg-white text-black px-8 font-black uppercase tracking-wider flex items-center gap-2 transition-colors shadow-[4px_4px_0px_#333] hover:translate-y-1 hover:shadow-none">
//               <FaPlus /> New Poll
//             </button>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto">
//         {/* LIVE MONITORING GRID */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
//             {/* WHISPERS CARD */}
//             <div className="md:col-span-2 brutalist-card p-0 flex flex-col h-64 relative overflow-hidden group">
//                 <div className="bg-[#111] border-b border-[#333] p-3 flex justify-between items-center">
//                     <div className="text-xs font-mono text-cyan-400 uppercase flex items-center gap-2"><FaTerminal /> Incoming Stream</div>
//                     <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
//                 </div>
//                 <div className="p-4 overflow-y-auto flex-1 space-y-2 font-mono text-sm relative z-10">
//                     {whispers.length === 0 && <span className="text-gray-700 italic">// Waiting for input...</span>}
//                     {whispers.map((w, index) => (
//                         <div key={index} className="border-l-2 border-cyan-500/50 pl-3 py-1 text-cyan-100 animate-slide-up">
//                             <span className="text-cyan-600 mr-2">{'>'}</span> {w}
//                         </div>
//                     ))}
//                 </div>
//                 {/* Decorative BG */}
//                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
//             </div>
            
//             {/* PANIC METER */}
//             <div className="brutalist-card p-6 flex flex-col justify-between relative overflow-hidden">
//                  <div className="flex justify-between items-start z-10">
//                     <div className="text-xs font-mono text-red-500 uppercase flex items-center gap-2"><FaGhost /> Panic Level</div>
//                     <div className="text-5xl font-black text-red-500 tabular-nums">{confusionLevel}%</div>
//                  </div>
                 
//                  {/* Visual Bar */}
//                  <div className="w-full h-4 bg-[#222] mt-4 relative overflow-hidden z-10">
//                     <div 
//                         className="h-full bg-red-600 transition-all duration-300 ease-out" 
//                         style={{ width: `${confusionLevel}%` }}
//                     ></div>
//                  </div>

//                  {/* Background Animation */}
//                  {confusionLevel > 30 && (
//                      <div className="absolute inset-0 bg-red-900/10 animate-pulse z-0"></div>
//                  )}
//             </div>
//         </div>

//         {/* POLLS SECTION */}
//         <div className="mb-6 flex items-center gap-4">
//              <div className="h-px bg-[#333] flex-1"></div>
//              <h3 className="font-mono text-[#ccff00] uppercase tracking-widest text-sm">Active Modules</h3>
//              <div className="h-px bg-[#333] flex-1"></div>
//         </div>

//         {pollsList.length === 0 ? (
//             <div className="border border-dashed border-[#333] p-16 text-center text-gray-600 font-mono">
//               <div className="text-4xl mb-4 grayscale opacity-20">📭</div>
//               <p className="mb-6">NO ACTIVE MODULES DETECTED</p>
//               <button onClick={() => setIsModalOpen(true)} className="text-[#ccff00] underline hover:text-white">INITIALIZE POLL</button>
//             </div>
//         ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {pollsList.map(p => <PollCard key={p._id || p.pollId} poll={p} />)}
//             </div>
//         )}
//       </div>

//       {/* FLOATING EMOJIS */}
//       <div className="fixed bottom-0 right-10 w-32 h-screen pointer-events-none z-50 overflow-hidden">
//         {reactions.map((r) => (
//             <div 
//                 key={r.id}
//                 className="absolute bottom-0 text-5xl animate-float-up opacity-0"
//                 style={{ 
//                     left: `${Math.random() * 60 + 20}%`, 
//                     animationDuration: `${1.5 + Math.random()}s` 
//                 }}
//             >
//                 {r.emoji}
//             </div>
//         ))}
//       </div>

//       {/* CREATE MODAL */}
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

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useSocket } from '../context/SocketContext';
// import { FaPlus, FaSignOutAlt, FaRegCopy, FaGhost, FaTerminal } from 'react-icons/fa';

// // Components
// import CreatePollModal from '../components/CreatePollModal';
// import PollCard from '../components/PollCard';

// const getAuthHeaders = () => {
//   const token = localStorage.getItem('token');
//   return { headers: { Authorization: `Bearer ${token}` } };
// };

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const socket = useSocket();
  
//   // --- SAFETY CHECK 1: Load User Data Safely ---
//   const [user, setUser] = useState(() => {
//     try {
//       const savedUser = localStorage.getItem('user');
//       return savedUser ? JSON.parse(savedUser) : null;
//     } catch (e) {
//       return null;
//     }
//   });

//   // --- STATE ---
//   const [pollsList, setPollsList] = useState([]);
//   const [roomCode, setRoomCode] = useState(null);
//   const [confusionLevel, setConfusionLevel] = useState(0);
//   const [whispers, setWhispers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [reactions, setReactions] = useState([]);

//   // --- SAFETY CHECK 2: Smart Name Detection ---
//   const getSafeName = (u) => {
//     if (!u) return "Host";
//     // Check top level, then nested 'user', then nested 'data'
//     const nameVal = u.name || u.user?.name || u.data?.name || "Host";
//     // Capitalize first letter and get first name only
//     return nameVal.split(' ')[0].charAt(0).toUpperCase() + nameVal.split(' ')[0].slice(1);
//   };

//   const displayName = getSafeName(user);

//   // --- FETCH DATA ---
//   const fetchInitialData = async () => {
//     try {
//       const response = await axios.get('http://localhost:3000/api/polls', getAuthHeaders());
      
//       const allPolls = response.data || [];
      
//       // Robust filtering: Ensure we only show polls belonging to this user
//       // Handles cases where ID might be nested differently
//       const userId = user?._id || user?.id || user?.user?._id;
      
//       const myPolls = allPolls.filter(p => {
//          const hostId = p.hostId?._id || p.hostId;
//          return hostId === userId;
//       });

//       setPollsList(myPolls);

//       if (myPolls.length > 0) {
//         // If polls exist, use the most recent one's code
//         const activeCode = myPolls[0].roomCode; 
//         setRoomCode(activeCode);
//         if(socket) socket.emit('join_room', activeCode);
//       } else {
//         setRoomCode('NEW');
//       }
//     } catch (error) {
//       console.error("Error fetching polls:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     if(socket) socket.disconnect(); 
//     navigate('/login');
//   };

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//         navigate('/login');
//         return;
//     }
//     fetchInitialData();
//   }, [navigate]);
  
//   useEffect(() => {
//     if (socket && roomCode && roomCode !== 'NEW') {
//       socket.emit('join_room', roomCode);

//       socket.on('poll_updated', (updatedPoll) => {
//         setPollsList(prev => {
//           const exists = prev.find(p => p._id === updatedPoll._id);
//           if (exists) return prev.map(p => (p._id === updatedPoll._id) ? updatedPoll : p);
//           return [updatedPoll, ...prev];
//         });
//       });

//       socket.on('panic_alert', () => setConfusionLevel(prev => Math.min(prev + 10, 100)));
//       socket.on('whisper_message', (data) => setWhispers(prev => [data.message, ...prev].slice(0, 5)));
//       socket.on('reaction_received', (data) => {
//         setReactions(prev => [...prev, data]);
//         setTimeout(() => setReactions(prev => prev.filter(r => r.id !== data.id)), 2000);
//       });
      
//       const decayInterval = setInterval(() => setConfusionLevel(prev => Math.max(prev - 5, 0)), 2000);

//       return () => {
//         socket.off('poll_updated');
//         socket.off('panic_alert');
//         socket.off('whisper_message');
//         socket.off('reaction_received');
//         clearInterval(decayInterval);
//       };
//     }
//   }, [socket, roomCode]);

//   // Loading State
//   if (loading) return (
//     <div className="flex h-screen items-center justify-center bg-[#030303] text-[#ccff00] font-mono animate-pulse">
//         LOADING_SYSTEM...
//     </div>
//   );

//   return (
//     <div className="w-full min-h-screen bg-[#030303] text-[#e0e0e0] p-6 pb-20 font-sans relative">
      
//       {/* NAVBAR */}
//       <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end mb-12 border-b border-[#333] pb-6 gap-6">
//         <div>
//             <div className="text-xs font-mono text-[#ccff00] mb-2 uppercase tracking-widest">/// HOST_TERMINAL_V1</div>
//             <h2 className="text-5xl font-black tracking-tighter text-white">HELLO, {displayName}</h2>
//         </div>

//         <div className="flex gap-4 items-center">
//              {/* ROOM CODE BADGE */}
//              <div className="flex flex-col items-end">
//                 <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Session Code</span>
//                 <button 
//                     onClick={() => {
//                         if(roomCode && roomCode !== 'NEW') {
//                             navigator.clipboard.writeText(roomCode);
//                             toast.success("COPIED");
//                         }
//                     }}
//                     className="group bg-[#111] border border-[#333] hover:border-[#ccff00] px-6 py-2 flex items-center gap-3 transition-all cursor-pointer"
//                 >
//                     <span className="text-2xl font-mono font-bold text-white group-hover:text-[#ccff00]">{roomCode || '...'}</span>
//                     <FaRegCopy className="text-gray-500 group-hover:text-[#ccff00]" />
//                 </button>
//              </div>

//             <button onClick={handleLogout} className="h-14 px-6 border border-[#333] hover:bg-red-900/20 hover:border-red-500 hover:text-red-500 text-gray-400 font-bold transition flex items-center gap-2">
//               <FaSignOutAlt/>
//             </button>
//             <button onClick={() => setIsModalOpen(true)} className="h-14 bg-[#ccff00] hover:bg-white text-black px-8 font-black uppercase tracking-wider flex items-center gap-2 transition-colors shadow-[4px_4px_0px_#333] hover:translate-y-1 hover:shadow-none">
//               <FaPlus /> New Poll
//             </button>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto">
//         {/* LIVE MONITORING GRID */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
//             {/* WHISPERS CARD */}
//             <div className="md:col-span-2 brutalist-card p-0 flex flex-col h-64 relative overflow-hidden group border border-[#333] bg-[#0a0a0a]">
//                 <div className="bg-[#111] border-b border-[#333] p-3 flex justify-between items-center">
//                     <div className="text-xs font-mono text-cyan-400 uppercase flex items-center gap-2"><FaTerminal /> Incoming Stream</div>
//                     <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
//                 </div>
//                 <div className="p-4 overflow-y-auto flex-1 space-y-2 font-mono text-sm relative z-10">
//                     {whispers.length === 0 && <span className="text-gray-700 italic">// Waiting for input...</span>}
//                     {whispers.map((w, index) => (
//                         <div key={index} className="border-l-2 border-cyan-500/50 pl-3 py-1 text-cyan-100 animate-slide-up">
//                             <span className="text-cyan-600 mr-2">{'>'}</span> {w}
//                         </div>
//                     ))}
//                 </div>
//             </div>
            
//             {/* PANIC METER */}
//             <div className="brutalist-card p-6 flex flex-col justify-between relative overflow-hidden border border-[#333] bg-[#0a0a0a]">
//                  <div className="flex justify-between items-start z-10">
//                     <div className="text-xs font-mono text-red-500 uppercase flex items-center gap-2"><FaGhost /> Panic Level</div>
//                     <div className="text-5xl font-black text-red-500 tabular-nums">{confusionLevel}%</div>
//                  </div>
//                  <div className="w-full h-4 bg-[#222] mt-4 relative overflow-hidden z-10">
//                     <div className="h-full bg-red-600 transition-all duration-300 ease-out" style={{ width: `${confusionLevel}%` }}></div>
//                  </div>
//             </div>
//         </div>

//         {/* POLLS SECTION */}
//         <div className="mb-6 flex items-center gap-4">
//              <div className="h-px bg-[#333] flex-1"></div>
//              <h3 className="font-mono text-[#ccff00] uppercase tracking-widest text-sm">Active Modules</h3>
//              <div className="h-px bg-[#333] flex-1"></div>
//         </div>

//         {pollsList.length === 0 ? (
//             <div className="border border-dashed border-[#333] p-16 text-center text-gray-600 font-mono">
//               <div className="text-4xl mb-4 grayscale opacity-20">📭</div>
//               <p className="mb-6">NO ACTIVE MODULES DETECTED</p>
//               <button onClick={() => setIsModalOpen(true)} className="text-[#ccff00] underline hover:text-white">INITIALIZE POLL</button>
//             </div>
//         ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {pollsList.map(p => <PollCard key={p._id} poll={p} />)}
//             </div>
//         )}
//       </div>

//       {/* FLOATING EMOJIS */}
//       <div className="fixed bottom-0 right-10 w-32 h-screen pointer-events-none z-50 overflow-hidden">
//         {reactions.map((r) => (
//             <div key={r.id} className="absolute bottom-0 text-5xl animate-float-up opacity-0" style={{ left: `${Math.random() * 60 + 20}%`, animationDuration: `${1.5 + Math.random()}s` }}>
//                 {r.emoji}
//             </div>
//         ))}
//       </div>

//       {/* CREATE MODAL */}
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

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSocket } from '../context/SocketContext';
import { FaPlus, FaSignOutAlt, FaRegCopy, FaGhost, FaTerminal, FaHistory, FaBroadcastTower } from 'react-icons/fa';

// Components
import CreatePollModal from '../components/CreatePollModal';
import PollCard from '../components/PollCard';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  
  // --- 1. LOAD USER SAFELY ---
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // --- 2. STATE ---
  const [pollsList, setPollsList] = useState([]);
  const [roomCode, setRoomCode] = useState(null);
  const [confusionLevel, setConfusionLevel] = useState(0);
  const [whispers, setWhispers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reactions, setReactions] = useState([]);

  // --- 3. HELPER: NUCLEAR DEDUPLICATION ---
  const updatePollsSafe = useCallback((newOrUpdatedPoll) => {
    setPollsList(prevList => {
      const incomingId = String(newOrUpdatedPoll._id || newOrUpdatedPoll.id);
      
      const exists = prevList.some(p => String(p._id || p.id) === incomingId);
      
      let newList;
      if (exists) {
        newList = prevList.map(p => String(p._id || p.id) === incomingId ? newOrUpdatedPoll : p);
      } else {
        newList = [newOrUpdatedPoll, ...prevList];
      }
      
      // Ensure strict sort order (Newest First)
      return newList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
  }, []);

  // --- 4. DISPLAY NAME ---
  const getDisplayName = () => {
    if (!user) return "Host";
    const name = user.name || user.user?.name || "Host";
    if (name === "Host") return "Host";
    return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1);
  };
  const displayName = getDisplayName();

  // --- 5. FETCH DATA (UPDATED FOR NEW ENDPOINT) ---
  const fetchInitialData = async () => {
    if (!user) return; // Safety check

    try {
      // 1. Get User ID robustly
      const userId = user._id || user.id || user.user?._id;

      if (!userId) {
          console.error("User ID not found in local storage data");
          return;
      }

      // 2. Call your NEW Endpoint
      // URL: /api/polls/user/:userId
      const response = await axios.get(
        `http://localhost:3000/api/polls/user/${userId}`, 
        getAuthHeaders()
      );

      const fetchedPolls = response.data || [];

      // 3. Sort by Newest First (Backend usually sends newest, but we double-check)
      const sortedPolls = fetchedPolls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPollsList(sortedPolls);

      if (sortedPolls.length > 0) {
        // Prefer an Active poll for the room code, otherwise use the newest
        const activePoll = sortedPolls.find(p => p.status === 'active');
        setRoomCode(activePoll ? activePoll.roomCode : sortedPolls[0].roomCode);
      } else {
        setRoomCode('NEW');
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
      // Optional: Toast error if you want visible feedback
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    if(socket) socket.disconnect(); 
    navigate('/login');
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
        navigate('/login');
    } else {
        fetchInitialData();
    }
  }, [navigate]);
  
  // --- 6. SOCKET LOGIC ---
  useEffect(() => {
    if (socket && roomCode && roomCode !== 'NEW') {
      console.log("🔌 Joining Room:", roomCode);
      socket.emit('join_room', roomCode);

      // Listeners
      const handlePollUpdate = (updatedPoll) => updatePollsSafe(updatedPoll);
      const handlePanic = () => setConfusionLevel(p => Math.min(p + 10, 100));
      const handleWhisper = (d) => setWhispers(p => [d.message, ...p].slice(0, 5));
      const handleReaction = (d) => {
        setReactions(p => [...p, d]);
        setTimeout(() => setReactions(p => p.filter(r => r.id !== d.id)), 2000);
      };

      socket.on('poll_updated', handlePollUpdate);
      socket.on('panic_alert', handlePanic);
      socket.on('whisper_message', handleWhisper);
      socket.on('reaction_received', handleReaction);
      
      const decayInterval = setInterval(() => setConfusionLevel(prev => Math.max(prev - 5, 0)), 2000);

      return () => {
        socket.off('poll_updated', handlePollUpdate);
        socket.off('panic_alert', handlePanic);
        socket.off('whisper_message', handleWhisper);
        socket.off('reaction_received', handleReaction);
        clearInterval(decayInterval);
      };
    }
  }, [socket, roomCode, updatePollsSafe]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#030303] text-[#ccff00] font-mono animate-pulse">LOADING SYSTEM...</div>;

  // Filter lists for the view
  const activePolls = pollsList.filter(p => p.status === 'active');
  const archivedPolls = pollsList.filter(p => p.status !== 'active');

  return (
    <div className="w-full min-h-screen bg-[#030303] text-[#e0e0e0] p-6 pb-20 font-sans relative">
      
      {/* NAVBAR */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end mb-12 border-b border-[#333] pb-6 gap-6">
        <div>
            <div className="text-xs font-mono text-[#ccff00] mb-2 uppercase tracking-widest">/// HOST_TERMINAL_V1</div>
            <h2 className="text-5xl font-black tracking-tighter text-white">HELLO, {displayName}</h2>
        </div>

        <div className="flex gap-4 items-center">
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Session Code</span>
                <button 
                    onClick={() => { if(roomCode && roomCode !== 'NEW') { navigator.clipboard.writeText(roomCode); toast.success("COPIED"); }}}
                    className="group bg-[#111] border border-[#333] hover:border-[#ccff00] px-6 py-2 flex items-center gap-3 transition-all cursor-pointer"
                >
                    <span className="text-2xl font-mono font-bold text-white group-hover:text-[#ccff00]">{roomCode || '...'}</span>
                    <FaRegCopy className="text-gray-500 group-hover:text-[#ccff00]" />
                </button>
             </div>

            <button onClick={handleLogout} className="h-14 px-6 border border-[#333] hover:bg-red-900/20 hover:border-red-500 hover:text-red-500 text-gray-400 font-bold transition flex items-center gap-2"><FaSignOutAlt/></button>
            <button onClick={() => setIsModalOpen(true)} className="h-14 bg-[#ccff00] hover:bg-white text-black px-8 font-black uppercase tracking-wider flex items-center gap-2 transition-colors shadow-[4px_4px_0px_#333] hover:translate-y-1 hover:shadow-none"><FaPlus /> New Poll</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="md:col-span-2 brutalist-card p-0 flex flex-col h-64 relative overflow-hidden group border border-[#333] bg-[#0a0a0a]">
                <div className="bg-[#111] border-b border-[#333] p-3 flex justify-between items-center">
                    <div className="text-xs font-mono text-cyan-400 uppercase flex items-center gap-2"><FaTerminal /> Incoming Stream</div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-2 font-mono text-sm relative z-10">
                    {whispers.map((w, index) => (
                        <div key={index} className="border-l-2 border-cyan-500/50 pl-3 py-1 text-cyan-100 animate-slide-up">
                            <span className="text-cyan-600 mr-2">{'>'}</span> {w}
                        </div>
                    ))}
                </div>
            </div>
            <div className="brutalist-card p-6 flex flex-col justify-between relative overflow-hidden border border-[#333] bg-[#0a0a0a]">
                 <div className="flex justify-between items-start z-10">
                    <div className="text-xs font-mono text-red-500 uppercase flex items-center gap-2"><FaGhost /> Panic Level</div>
                    <div className="text-5xl font-black text-red-500 tabular-nums">{confusionLevel}%</div>
                 </div>
                 <div className="w-full h-4 bg-[#222] mt-4 relative overflow-hidden z-10">
                    <div className="h-full bg-red-600 transition-all duration-300 ease-out" style={{ width: `${confusionLevel}%` }}></div>
                 </div>
            </div>
        </div>

        {/* --- SECTION 1: ACTIVE POLLS --- */}
        <div className="mb-6 flex items-center gap-4">
             <div className="h-px bg-[#ccff00] flex-1"></div>
             <h3 className="font-mono text-[#ccff00] uppercase tracking-widest text-sm flex items-center gap-2"><FaBroadcastTower/> Active Broadcasts</h3>
             <div className="h-px bg-[#ccff00] flex-1"></div>
        </div>

        {activePolls.length === 0 ? (
            <div className="border border-dashed border-[#333] p-12 text-center text-gray-600 font-mono mb-12">
              <p className="mb-4">NO ACTIVE BROADCASTS</p>
              <button onClick={() => setIsModalOpen(true)} className="text-[#ccff00] underline hover:text-white">START A NEW POLL</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {activePolls.map(p => <PollCard key={p._id || p.pollId} poll={p} />)}
            </div>
        )}

        {/* --- SECTION 2: ARCHIVED POLLS --- */}
        {archivedPolls.length > 0 && (
          <>
            <div className="mb-6 flex items-center gap-4 mt-12">
                <div className="h-px bg-[#333] flex-1"></div>
                <h3 className="font-mono text-gray-500 uppercase tracking-widest text-sm flex items-center gap-2"><FaHistory /> Archived Logs</h3>
                <div className="h-px bg-[#333] flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
                {archivedPolls.map(p => <PollCard key={p._id || p.pollId} poll={p} />)}
            </div>
          </>
        )}
      </div>

      {/* FLOATING EMOJIS */}
      <div className="fixed bottom-0 right-10 w-32 h-screen pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => (
            <div key={r.id} className="absolute bottom-0 text-5xl animate-float-up opacity-0" style={{ left: `${Math.random() * 60 + 20}%`, animationDuration: `${1.5 + Math.random()}s` }}>{r.emoji}</div>
        ))}
      </div>

      <CreatePollModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={(newPoll) => {
            // 1. SAFE ADD: Use the unique updater to show it instantly
            updatePollsSafe(newPoll);

            // 2. JOIN ROOM
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