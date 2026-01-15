// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useSocket } from '../context/SocketContext';
// import { FaPlus, FaSignOutAlt, FaRegCopy, FaGhost, FaTerminal, FaHistory, FaBroadcastTower, FaChevronDown, FaChevronUp, FaTrashAlt } from 'react-icons/fa';

// // Components
// import CreatePollModal from '../components/CreatePollModal';
// import PollDetailsModal from '../components/PollDetailsModal';
// import PollCard from '../components/PollCard';
// import ConfirmationModal from '../components/ConfirmationModal'; // 👈 IMPORTED

// const getAuthHeaders = () => {
//   const token = localStorage.getItem('token');
//   return { headers: { Authorization: `Bearer ${token}` } };
// };

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const socket = useSocket();
  
//   // --- STATE ---
//   const [user, setUser] = useState(() => {
//     try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
//   });
//   const [pollsList, setPollsList] = useState([]); 
//   const [roomCode, setRoomCode] = useState(null);
//   const [confusionLevel, setConfusionLevel] = useState(0);
//   const [whispers, setWhispers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [reactions, setReactions] = useState([]);
//   const [showAllArchived, setShowAllArchived] = useState(false);
//   const [selectedPoll, setSelectedPoll] = useState(null);
  
//   // 👇 NEW STATES FOR PURGE MODAL
//   const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
//   const [isPurging, setIsPurging] = useState(false);

//   // --- HELPER: SAFE UPDATES ---
//   const updatePollsSafe = useCallback((newOrUpdatedPoll) => {
//     setPollsList(prevList => {
//       const incomingId = String(newOrUpdatedPoll._id || newOrUpdatedPoll.id);
//       const exists = prevList.some(p => String(p._id || p.id) === incomingId);
      
//       let newList;
//       if (exists) {
//         newList = prevList.map(p => String(p._id || p.id) === incomingId ? newOrUpdatedPoll : p);
//         if (selectedPoll && String(selectedPoll._id) === incomingId) {
//             setSelectedPoll(newOrUpdatedPoll);
//         }
//       } else {
//         newList = [newOrUpdatedPoll, ...prevList];
//       }
//       return newList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     });
//   }, [selectedPoll]);

//   // HANDLES STOP/DELETE
//   const handleLocalPollChange = (data, isDelete = false) => {
//     if (isDelete) {
//         setPollsList(prev => prev.filter(p => (p._id || p.id) !== data));
//         if (selectedPoll && (selectedPoll._id === data)) setSelectedPoll(null);
//     } else {
//         updatePollsSafe(data);
//     }
    
//     if (roomCode && (isDelete || data.status === 'closed')) {
//         const touchedId = isDelete ? data : (data._id || data.id);
//         const currentActive = pollsList.find(p => p.status === 'active');
//         if (currentActive && (currentActive._id || currentActive.id) === touchedId) {
//              setRoomCode(null);
//         }
//     }
//   };

//   // 👇 STEP 1: OPEN THE MODAL
//   const openPurgeModal = () => {
//     const archivedCount = pollsList.filter(p => p.status !== 'active').length;
//     if (archivedCount === 0) return;
//     setIsPurgeModalOpen(true);
//   };

//   // 👇 STEP 2: ACTUALLY DELETE (Passed to Modal)
//   const executePurge = async () => {
//     const archived = pollsList.filter(p => p.status !== 'active');
//     setIsPurging(true);
//     let deletedCount = 0;

//     try {
//         await Promise.all(archived.map(async (poll) => {
//             try {
//                 await axios.delete(`http://localhost:3000/api/polls/${poll._id}`, getAuthHeaders());
//                 deletedCount++;
//             } catch (err) {
//                 console.error("Failed to delete one poll:", err);
//             }
//         }));

//         setPollsList(prev => prev.filter(p => p.status === 'active')); 
//         toast.success(`Purged ${deletedCount} archived logs.`);
//         setIsPurgeModalOpen(false); // Close modal on success
        
//     } catch (error) {
//         toast.error("Error during purge operation.");
//     } finally {
//         setIsPurging(false);
//     }
//   };

//   const getDisplayName = () => {
//     if (!user) return "Host";
//     const name = user.name || user.user?.name || "Host";
//     if (name === "Host") return "Host";
//     return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1);
//   };
//   const displayName = getDisplayName();

//   // --- FETCH HISTORY ---
//   const fetchAllHistory = async () => {
//     if (!user) return; 
//     try {
//       const userId = user._id || user.id || user.user?._id;
//       if (!userId) { console.error("❌ Fatal: User ID missing."); return; }

//       const response = await axios.get(`http://localhost:3000/api/polls/user/${userId}`, getAuthHeaders());
//       let rawData = response.data;
//       let pollsArray = Array.isArray(rawData) ? rawData : (rawData.polls || rawData.data || []);
      
//       const sortedPolls = pollsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       setPollsList(sortedPolls);

//       if (sortedPolls.length > 0) {
//         const activePoll = sortedPolls.find(p => p.status === 'active');
//         setRoomCode(activePoll ? activePoll.roomCode : null);
//       } else {
//         setRoomCode(null);
//       }
//     } catch (error) {
//       if (error.response && error.response.status !== 404) toast.error("Could not sync history.");
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
//     if (!localStorage.getItem('token')) navigate('/login');
//     else fetchAllHistory();
//   }, [navigate]);
  
//   // --- SOCKET ---
//   useEffect(() => {
//     if (socket && roomCode && roomCode !== 'NEW') {
//       socket.emit('join_room', roomCode);

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

//   if (loading) return <div className="flex h-screen items-center justify-center bg-[#030303] text-[#ccff00] font-mono animate-pulse">RESTORING HISTORY...</div>;

//   const activePolls = pollsList.filter(p => p.status === 'active');
//   const archivedPolls = pollsList.filter(p => p.status !== 'active');
//   const visibleArchivedPolls = showAllArchived ? archivedPolls : archivedPolls.slice(0, 3);

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
//                     onClick={() => { if(roomCode) { navigator.clipboard.writeText(roomCode); toast.success("COPIED"); } }}
//                     className={`group border px-6 py-2 flex items-center gap-3 transition-all ${roomCode ? 'bg-[#111] border-[#333] hover:border-[#ccff00] cursor-pointer' : 'bg-transparent border-[#222] cursor-not-allowed opacity-50'}`}
//                 >
//                     <span className={`text-2xl font-mono font-bold ${roomCode ? 'text-white group-hover:text-[#ccff00]' : 'text-gray-600'}`}>{roomCode || 'OFFLINE'}</span>
//                     {roomCode && <FaRegCopy className="text-gray-500 group-hover:text-[#ccff00]" />}
//                 </button>
//              </div>
//             <button onClick={handleLogout} className="h-14 px-6 border border-[#333] hover:bg-red-900/20 hover:border-red-500 hover:text-red-500 text-gray-400 font-bold transition flex items-center gap-2"><FaSignOutAlt/></button>
//             <button onClick={() => setIsModalOpen(true)} className="h-14 bg-[#ccff00] hover:bg-white text-black px-8 font-black uppercase tracking-wider flex items-center gap-2 transition-colors shadow-[4px_4px_0px_#333] hover:translate-y-1 hover:shadow-none"><FaPlus /> New Poll</button>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto">
//         {/* METRICS & WHISPERS */}
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

//         {/* --- ACTIVE BROADCASTS --- */}
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
//                 {activePolls.map(p => (
//                     <PollCard 
//                         key={p._id || p.pollId} 
//                         poll={p} 
//                         onUpdate={handleLocalPollChange} 
//                         onClick={() => setSelectedPoll(p)}
//                     />
//                 ))}
//             </div>
//         )}

//         {/* --- ARCHIVED LOGS --- */}
//         {archivedPolls.length > 0 && (
//           <>
//             <div className="mb-6 flex items-center justify-between mt-12">
//                 <div className="flex items-center gap-4 flex-1">
//                     <div className="h-px bg-[#333] flex-1"></div>
//                     <h3 className="font-mono text-gray-500 uppercase tracking-widest text-sm flex items-center gap-2"><FaHistory /> Archived Logs</h3>
//                 </div>
                
//                 {/* 👇 PURGE BUTTON TRIGGERS MODAL */}
//                 <button 
//                     onClick={openPurgeModal}
//                     className="ml-4 flex items-center gap-2 text-xs font-mono text-red-900 hover:text-red-500 uppercase tracking-widest border border-red-900/30 hover:border-red-500 px-3 py-1 rounded transition-all"
//                 >
//                     <FaTrashAlt /> Purge All
//                 </button>
                
//                 <div className="h-px bg-[#333] flex-1"></div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300 mb-8">
//                 {visibleArchivedPolls.map(p => (
//                     <PollCard 
//                         key={p._id || p.pollId} 
//                         poll={p} 
//                         onUpdate={handleLocalPollChange} 
//                         onClick={() => setSelectedPoll(p)}
//                     />
//                 ))}
//             </div>

//             {archivedPolls.length > 3 && (
//                 <div className="flex justify-center pb-8">
//                     <button 
//                         onClick={() => setShowAllArchived(!showAllArchived)}
//                         className="flex items-center gap-2 text-[#ccff00] font-mono text-sm uppercase tracking-widest hover:text-white transition-colors py-2 px-4 border border-[#333] hover:border-[#ccff00] rounded-full"
//                     >
//                         {showAllArchived ? <>Show Less <FaChevronUp /></> : <>See All Archives ({archivedPolls.length}) <FaChevronDown /></>}
//                     </button>
//                 </div>
//             )}
//           </>
//         )}
//       </div>

//       <div className="fixed bottom-0 right-10 w-32 h-screen pointer-events-none z-50 overflow-hidden">
//         {reactions.map((r) => <div key={r.id} className="absolute bottom-0 text-5xl animate-float-up opacity-0" style={{ left: `${Math.random() * 60 + 20}%`, animationDuration: `${1.5 + Math.random()}s` }}>{r.emoji}</div>)}
//       </div>

//       <CreatePollModal 
//         isOpen={isModalOpen} 
//         onClose={() => setIsModalOpen(false)} 
//         onCreated={(newPoll) => {
//             updatePollsSafe(newPoll);
//             if (!roomCode || roomCode === 'NEW') {
//                 setRoomCode(newPoll.roomCode);
//                 if(socket) socket.emit('join_room', newPoll.roomCode);
//             }
//         }}
//         roomCode={roomCode}
//       />

//       <PollDetailsModal 
//         isOpen={!!selectedPoll} 
//         poll={selectedPoll} 
//         onClose={() => setSelectedPoll(null)}
//         liveWhispers={whispers}
//       />

//       {/* 👇 NEW CONFIRMATION MODAL */}
//       <ConfirmationModal
//         isOpen={isPurgeModalOpen}
//         onClose={() => setIsPurgeModalOpen(false)}
//         onConfirm={executePurge}
//         isLoading={isPurging}
//         title="Purge Archives"
//         message={`This action will permanently delete all ${pollsList.filter(p => p.status !== 'active').length} archived polls. This data cannot be recovered.`}
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
import { FaPlus, FaSignOutAlt, FaRegCopy, FaGhost, FaTerminal, FaHistory, FaBroadcastTower, FaChevronDown, FaChevronUp, FaTrashAlt } from 'react-icons/fa';

// Components
import CreatePollModal from '../components/CreatePollModal';
import PollDetailsModal from '../components/PollDetailsModal';
import PollCard from '../components/PollCard';
import ConfirmationModal from '../components/ConfirmationModal';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  
  // --- STATE ---
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
  });
  
  const [pollsList, setPollsList] = useState([]); 
  const [roomCode, setRoomCode] = useState(null);
  const [confusionLevel, setConfusionLevel] = useState(0);
  const [whispers, setWhispers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI Toggles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [showAllArchived, setShowAllArchived] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [copied, setCopied] = useState(false); // 👈 FOR SMART BUTTON

  // Purge Modal State
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // --- HELPER: SAFE UPDATES ---
  const updatePollsSafe = useCallback((newOrUpdatedPoll) => {
    setPollsList(prevList => {
      const incomingId = String(newOrUpdatedPoll._id || newOrUpdatedPoll.id);
      const exists = prevList.some(p => String(p._id || p.id) === incomingId);
      
      let newList;
      if (exists) {
        newList = prevList.map(p => String(p._id || p.id) === incomingId ? newOrUpdatedPoll : p);
        if (selectedPoll && String(selectedPoll._id) === incomingId) {
            setSelectedPoll(newOrUpdatedPoll);
        }
      } else {
        newList = [newOrUpdatedPoll, ...prevList];
      }
      return newList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
  }, [selectedPoll]);

  // HANDLES STOP/DELETE FROM CHILD CARDS
  const handleLocalPollChange = (data, isDelete = false) => {
    if (isDelete) {
        setPollsList(prev => prev.filter(p => (p._id || p.id) !== data));
        if (selectedPoll && (selectedPoll._id === data)) setSelectedPoll(null);
    } else {
        updatePollsSafe(data);
    }
    
    // If the active poll was closed/deleted, clear the code immediately
    if (roomCode && (isDelete || data.status === 'closed')) {
        const touchedId = isDelete ? data : (data._id || data.id);
        const currentActive = pollsList.find(p => p.status === 'active');
        if (currentActive && (currentActive._id || currentActive.id) === touchedId) {
             setRoomCode(null);
        }
    }
  };

  // --- PURGE LOGIC ---
  const openPurgeModal = () => {
    const archivedCount = pollsList.filter(p => p.status !== 'active').length;
    if (archivedCount === 0) return;
    setIsPurgeModalOpen(true);
  };

  const executePurge = async () => {
    const archived = pollsList.filter(p => p.status !== 'active');
    setIsPurging(true);
    
    try {
        await Promise.all(archived.map(async (poll) => {
            try {
                await axios.delete(`http://localhost:3000/api/polls/${poll._id}`, getAuthHeaders());
            } catch (err) {
                console.error("Failed to delete one poll:", err);
            }
        }));

        setPollsList(prev => prev.filter(p => p.status === 'active')); 
        // No Toast here - Visual update is enough
        setIsPurgeModalOpen(false); 
        
    } catch (error) {
        toast.error("System Error: Purge failed.");
    } finally {
        setIsPurging(false);
    }
  };

  const getDisplayName = () => {
    if (!user) return "Host";
    const name = user.name || user.user?.name || "Host";
    if (name === "Host") return "Host";
    return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1);
  };
  const displayName = getDisplayName();

  // --- FETCH HISTORY ---
  const fetchAllHistory = async () => {
    if (!user) return; 
    try {
      const userId = user._id || user.id || user.user?._id;
      if (!userId) { console.error("❌ Fatal: User ID missing."); return; }

      const response = await axios.get(`http://localhost:3000/api/polls/user/${userId}`, getAuthHeaders());
      let rawData = response.data;
      let pollsArray = Array.isArray(rawData) ? rawData : (rawData.polls || rawData.data || []);
      
      const sortedPolls = pollsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPollsList(sortedPolls);

      if (sortedPolls.length > 0) {
        const activePoll = sortedPolls.find(p => p.status === 'active');
        setRoomCode(activePoll ? activePoll.roomCode : null);
      } else {
        setRoomCode(null);
      }
    } catch (error) {
      if (error.response && error.response.status !== 404) toast.error("Connection Error: Could not sync.");
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
    if (!localStorage.getItem('token')) navigate('/login');
    else fetchAllHistory();
  }, [navigate]);
  
  // --- SOCKET ---
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

  const activePolls = pollsList.filter(p => p.status === 'active');
  const archivedPolls = pollsList.filter(p => p.status !== 'active');
  const visibleArchivedPolls = showAllArchived ? archivedPolls : archivedPolls.slice(0, 3);

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
                    onClick={() => { 
                        if(roomCode) { 
                            navigator.clipboard.writeText(roomCode); 
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        } 
                    }}
                    className={`group border px-6 py-2 flex items-center gap-3 transition-all ${roomCode ? 'bg-[#111] border-[#333] hover:border-[#ccff00] cursor-pointer' : 'bg-transparent border-[#222] cursor-not-allowed opacity-50'}`}
                >
                    <span className={`text-2xl font-mono font-bold ${roomCode ? 'text-white group-hover:text-[#ccff00]' : 'text-gray-600'}`}>
                        {copied ? 'COPIED!' : (roomCode || 'OFFLINE')}
                    </span>
                    {!copied && roomCode && <FaRegCopy className="text-gray-500 group-hover:text-[#ccff00]" />}
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

        {/* --- ACTIVE BROADCASTS --- */}
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
                {activePolls.map(p => (
                    <PollCard 
                        key={p._id || p.pollId} 
                        poll={p} 
                        onUpdate={handleLocalPollChange} 
                        onClick={() => setSelectedPoll(p)}
                    />
                ))}
            </div>
        )}

        {/* --- ARCHIVED LOGS --- */}
        {archivedPolls.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between mt-12">
                <div className="flex items-center gap-4 flex-1">
                    <div className="h-px bg-[#333] flex-1"></div>
                    <h3 className="font-mono text-gray-500 uppercase tracking-widest text-sm flex items-center gap-2"><FaHistory /> Archived Logs</h3>
                </div>
                
                <button 
                    onClick={openPurgeModal}
                    className="ml-4 flex items-center gap-2 text-xs font-mono text-red-900 hover:text-red-500 uppercase tracking-widest border border-red-900/30 hover:border-red-500 px-3 py-1 rounded transition-all"
                >
                    <FaTrashAlt /> Purge All
                </button>
                
                <div className="h-px bg-[#333] flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300 mb-8">
                {visibleArchivedPolls.map(p => (
                    <PollCard 
                        key={p._id || p.pollId} 
                        poll={p} 
                        onUpdate={handleLocalPollChange} 
                        onClick={() => setSelectedPoll(p)}
                    />
                ))}
            </div>

            {archivedPolls.length > 3 && (
                <div className="flex justify-center pb-8">
                    <button 
                        onClick={() => setShowAllArchived(!showAllArchived)}
                        className="flex items-center gap-2 text-[#ccff00] font-mono text-sm uppercase tracking-widest hover:text-white transition-colors py-2 px-4 border border-[#333] hover:border-[#ccff00] rounded-full"
                    >
                        {showAllArchived ? <>Show Less <FaChevronUp /></> : <>See All Archives ({archivedPolls.length}) <FaChevronDown /></>}
                    </button>
                </div>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 right-10 w-32 h-screen pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => <div key={r.id} className="absolute bottom-0 text-5xl animate-float-up opacity-0" style={{ left: `${Math.random() * 60 + 20}%`, animationDuration: `${1.5 + Math.random()}s` }}>{r.emoji}</div>)}
      </div>

      <CreatePollModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={(newPoll) => {
            updatePollsSafe(newPoll);
            if (!roomCode || roomCode === 'NEW') {
                setRoomCode(newPoll.roomCode);
                if(socket) socket.emit('join_room', newPoll.roomCode);
            }
        }}
        roomCode={roomCode}
      />

      <PollDetailsModal 
        isOpen={!!selectedPoll} 
        poll={selectedPoll} 
        onClose={() => setSelectedPoll(null)}
        liveWhispers={whispers}
      />

      {/* CONFIRMATION MODAL FOR PURGE */}
      <ConfirmationModal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        onConfirm={executePurge}
        isLoading={isPurging}
        title="Purge Archives"
        message={`This action will permanently delete all ${pollsList.filter(p => p.status !== 'active').length} archived polls. This data cannot be recovered.`}
      />
    </div>
  );
};

export default Dashboard;
