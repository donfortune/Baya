// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useSocket } from '../context/SocketContext';
// import { FaPlus, FaSignOutAlt, FaRegCopy, FaGhost, FaTerminal, FaHistory, FaBroadcastTower } from 'react-icons/fa';

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
  
//   // --- 1. LOAD USER SAFELY ---
//   const [user, setUser] = useState(() => {
//     try {
//       const saved = localStorage.getItem('user');
//       return saved ? JSON.parse(saved) : null;
//     } catch (e) {
//       return null;
//     }
//   });

//   // --- 2. STATE ---
//   const [pollsList, setPollsList] = useState([]);
//   const [roomCode, setRoomCode] = useState(null);
//   const [confusionLevel, setConfusionLevel] = useState(0);
//   const [whispers, setWhispers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [reactions, setReactions] = useState([]);

//   // --- 3. HELPER: NUCLEAR DEDUPLICATION ---
//   const updatePollsSafe = useCallback((newOrUpdatedPoll) => {
//     setPollsList(prevList => {
//       const incomingId = String(newOrUpdatedPoll._id || newOrUpdatedPoll.id);
      
//       const exists = prevList.some(p => String(p._id || p.id) === incomingId);
      
//       let newList;
//       if (exists) {
//         newList = prevList.map(p => String(p._id || p.id) === incomingId ? newOrUpdatedPoll : p);
//       } else {
//         newList = [newOrUpdatedPoll, ...prevList];
//       }
      
//       // Ensure strict sort order (Newest First)
//       return newList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     });
//   }, []);

//   // --- 4. DISPLAY NAME ---
//   const getDisplayName = () => {
//     if (!user) return "Host";
//     const name = user.name || user.user?.name || "Host";
//     if (name === "Host") return "Host";
//     return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1);
//   };
//   const displayName = getDisplayName();

//   // --- 5. FETCH DATA (UPDATED FOR NEW ENDPOINT) ---
//   const fetchInitialData = async () => {
//     if (!user) return; // Safety check

//     try {
//       // 1. Get User ID robustly
//       const userId = user._id || user.id || user.user?._id;

//       if (!userId) {
//           console.error("User ID not found in local storage data");
//           return;
//       }

//       // 2. Call your NEW Endpoint
//       // URL: /api/polls/user/:userId
//       const response = await axios.get(
//         `http://localhost:3000/api/polls/user/${userId}`, 
//         getAuthHeaders()
//       );

//       const fetchedPolls = response.data || [];

//       // 3. Sort by Newest First (Backend usually sends newest, but we double-check)
//       const sortedPolls = fetchedPolls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//       setPollsList(sortedPolls);

//       if (sortedPolls.length > 0) {
//         // Prefer an Active poll for the room code, otherwise use the newest
//         const activePoll = sortedPolls.find(p => p.status === 'active');
//         setRoomCode(activePoll ? activePoll.roomCode : sortedPolls[0].roomCode);
//       } else {
//         setRoomCode('NEW');
//       }
//     } catch (error) {
//       console.error("Error fetching polls:", error);
//       // Optional: Toast error if you want visible feedback
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     if(socket) socket.disconnect(); 
//     navigate('/login');
//   };

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//         navigate('/login');
//     } else {
//         fetchInitialData();
//     }
//   }, [navigate]);
  
//   // --- 6. SOCKET LOGIC ---
//   useEffect(() => {
//     if (socket && roomCode && roomCode !== 'NEW') {
//       console.log("🔌 Joining Room:", roomCode);
//       socket.emit('join_room', roomCode);

//       // Listeners
//       const handlePollUpdate = (updatedPoll) => updatePollsSafe(updatedPoll);
//       const handlePanic = () => setConfusionLevel(p => Math.min(p + 10, 100));
//       const handleWhisper = (d) => setWhispers(p => [d.message, ...p].slice(0, 5));
//       const handleReaction = (d) => {
//         setReactions(p => [...p, d]);
//         setTimeout(() => setReactions(p => p.filter(r => r.id !== d.id)), 2000);
//       };

//       socket.on('poll_updated', handlePollUpdate);
//       socket.on('panic_alert', handlePanic);
//       socket.on('whisper_message', handleWhisper);
//       socket.on('reaction_received', handleReaction);
      
//       const decayInterval = setInterval(() => setConfusionLevel(prev => Math.max(prev - 5, 0)), 2000);

//       return () => {
//         socket.off('poll_updated', handlePollUpdate);
//         socket.off('panic_alert', handlePanic);
//         socket.off('whisper_message', handleWhisper);
//         socket.off('reaction_received', handleReaction);
//         clearInterval(decayInterval);
//       };
//     }
//   }, [socket, roomCode, updatePollsSafe]);

//   if (loading) return <div className="flex h-screen items-center justify-center bg-[#030303] text-[#ccff00] font-mono animate-pulse">LOADING SYSTEM...</div>;

//   // Filter lists for the view
//   const activePolls = pollsList.filter(p => p.status === 'active');
//   const archivedPolls = pollsList.filter(p => p.status !== 'active');

//   return (
//     <div className="w-full min-h-screen bg-[#030303] text-[#e0e0e0] p-6 pb-20 font-sans relative">
      
//       {/* NAVBAR */}
//       <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end mb-12 border-b border-[#333] pb-6 gap-6">
//         <div>
//             <div className="text-xs font-mono text-[#ccff00] mb-2 uppercase tracking-widest">/// HOST_TERMINAL_V1</div>
//             <h2 className="text-5xl font-black tracking-tighter text-white">HELLO, {displayName}</h2>
//         </div>

//         <div className="flex gap-4 items-center">
//              <div className="flex flex-col items-end">
//                 <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Session Code</span>
//                 <button 
//                     onClick={() => { if(roomCode && roomCode !== 'NEW') { navigator.clipboard.writeText(roomCode); toast.success("COPIED"); }}}
//                     className="group bg-[#111] border border-[#333] hover:border-[#ccff00] px-6 py-2 flex items-center gap-3 transition-all cursor-pointer"
//                 >
//                     <span className="text-2xl font-mono font-bold text-white group-hover:text-[#ccff00]">{roomCode || '...'}</span>
//                     <FaRegCopy className="text-gray-500 group-hover:text-[#ccff00]" />
//                 </button>
//              </div>

//             <button onClick={handleLogout} className="h-14 px-6 border border-[#333] hover:bg-red-900/20 hover:border-red-500 hover:text-red-500 text-gray-400 font-bold transition flex items-center gap-2"><FaSignOutAlt/></button>
//             <button onClick={() => setIsModalOpen(true)} className="h-14 bg-[#ccff00] hover:bg-white text-black px-8 font-black uppercase tracking-wider flex items-center gap-2 transition-colors shadow-[4px_4px_0px_#333] hover:translate-y-1 hover:shadow-none"><FaPlus /> New Poll</button>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto">
//         {/* METRICS */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//             <div className="md:col-span-2 brutalist-card p-0 flex flex-col h-64 relative overflow-hidden group border border-[#333] bg-[#0a0a0a]">
//                 <div className="bg-[#111] border-b border-[#333] p-3 flex justify-between items-center">
//                     <div className="text-xs font-mono text-cyan-400 uppercase flex items-center gap-2"><FaTerminal /> Incoming Stream</div>
//                     <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
//                 </div>
//                 <div className="p-4 overflow-y-auto flex-1 space-y-2 font-mono text-sm relative z-10">
//                     {whispers.map((w, index) => (
//                         <div key={index} className="border-l-2 border-cyan-500/50 pl-3 py-1 text-cyan-100 animate-slide-up">
//                             <span className="text-cyan-600 mr-2">{'>'}</span> {w}
//                         </div>
//                     ))}
//                 </div>
//             </div>
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

//         {/* --- SECTION 1: ACTIVE POLLS --- */}
//         <div className="mb-6 flex items-center gap-4">
//              <div className="h-px bg-[#ccff00] flex-1"></div>
//              <h3 className="font-mono text-[#ccff00] uppercase tracking-widest text-sm flex items-center gap-2"><FaBroadcastTower/> Active Broadcasts</h3>
//              <div className="h-px bg-[#ccff00] flex-1"></div>
//         </div>

//         {activePolls.length === 0 ? (
//             <div className="border border-dashed border-[#333] p-12 text-center text-gray-600 font-mono mb-12">
//               <p className="mb-4">NO ACTIVE BROADCASTS</p>
//               <button onClick={() => setIsModalOpen(true)} className="text-[#ccff00] underline hover:text-white">START A NEW POLL</button>
//             </div>
//         ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
//                 {activePolls.map(p => <PollCard key={p._id || p.pollId} poll={p} />)}
//             </div>
//         )}

//         {/* --- SECTION 2: ARCHIVED POLLS --- */}
//         {archivedPolls.length > 0 && (
//           <>
//             <div className="mb-6 flex items-center gap-4 mt-12">
//                 <div className="h-px bg-[#333] flex-1"></div>
//                 <h3 className="font-mono text-gray-500 uppercase tracking-widest text-sm flex items-center gap-2"><FaHistory /> Archived Logs</h3>
//                 <div className="h-px bg-[#333] flex-1"></div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
//                 {archivedPolls.map(p => <PollCard key={p._id || p.pollId} poll={p} />)}
//             </div>
//           </>
//         )}
//       </div>

//       {/* FLOATING EMOJIS */}
//       <div className="fixed bottom-0 right-10 w-32 h-screen pointer-events-none z-50 overflow-hidden">
//         {reactions.map((r) => (
//             <div key={r.id} className="absolute bottom-0 text-5xl animate-float-up opacity-0" style={{ left: `${Math.random() * 60 + 20}%`, animationDuration: `${1.5 + Math.random()}s` }}>{r.emoji}</div>
//         ))}
//       </div>

//       <CreatePollModal 
//         isOpen={isModalOpen} 
//         onClose={() => setIsModalOpen(false)} 
//         onCreated={(newPoll) => {
//             // 1. SAFE ADD: Use the unique updater to show it instantly
//             updatePollsSafe(newPoll);

//             // 2. JOIN ROOM
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
  
  // --- 1. PERSISTENCE LAYER: RESTORE USER ON REFRESH ---
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
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

  // --- 3. HELPER: SAFE UPDATES (Prevents Duplicates) ---
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
      
      // Always keep sorted: Newest at top
      return newList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
  }, []);

  const getDisplayName = () => {
    if (!user) return "Host";
    const name = user.name || user.user?.name || "Host";
    if (name === "Host") return "Host";
    return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1);
  };
  const displayName = getDisplayName();

  // --- 4. THE RESTORE FUNCTION (CRASH PROOF VERSION) ---
  const fetchAllHistory = async () => {
    if (!user) return; 

    try {
      const userId = user._id || user.id || user.user?._id;

      if (!userId) {
          console.error("❌ Fatal: User ID missing from storage.");
          return;
      }

      console.log(`🔄 Fetching history for User: ${userId}`);

      const response = await axios.get(
        `http://localhost:3000/api/polls/user/${userId}`, 
        getAuthHeaders()
      );

      // 🔍 SAFELY EXTRACT THE ARRAY (Fixes "sort is not a function")
      let rawData = response.data;
      let pollsArray = [];

      // Check all possible ways the backend might return data
      if (Array.isArray(rawData)) {
          pollsArray = rawData;
      } else if (rawData && Array.isArray(rawData.polls)) {
          pollsArray = rawData.polls;
      } else if (rawData && Array.isArray(rawData.data)) {
          pollsArray = rawData.data;
      } else {
          console.warn("⚠️ Server response is not a list:", rawData);
          pollsArray = []; 
      }
      
      // Now it is safe to sort because we GUARANTEE it's an array
      const sortedPolls = pollsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log(`✅ Loaded ${sortedPolls.length} past polls.`);
      setPollsList(sortedPolls);

      // Restore Room Code (Prefer active, else newest)
      if (sortedPolls.length > 0) {
        const activePoll = sortedPolls.find(p => p.status === 'active');
        setRoomCode(activePoll ? activePoll.roomCode : sortedPolls[0].roomCode);
      } else {
        setRoomCode('NEW');
      }
    } catch (error) {
      console.error("Error loading history:", error);
      // Don't toast on 404 (just means no history yet)
      if (error.response && error.response.status !== 404) {
         toast.error("Could not sync history.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    if(socket) socket.disconnect(); 
    navigate('/login');
  };

  // --- 5. INITIALIZATION EFFECT ---
  useEffect(() => {
    if (!localStorage.getItem('token')) {
        navigate('/login');
    } else {
        fetchAllHistory();
    }
  }, [navigate]);
  
  // --- 6. SOCKET LOGIC ---
  useEffect(() => {
    if (socket && roomCode && roomCode !== 'NEW') {
      socket.emit('join_room', roomCode);

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

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#030303] text-[#ccff00] font-mono animate-pulse">RESTORING HISTORY...</div>;

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
        {/* METRICS & WHISPERS */}
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

        {/* --- SECTION 1: ACTIVE BROADCASTS --- */}
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

        {/* --- SECTION 2: ARCHIVED LOGS --- */}
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
            // Immediate update for Host
            updatePollsSafe(newPoll);
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
