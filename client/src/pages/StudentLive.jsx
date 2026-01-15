// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useSocket } from '../context/SocketContext';
// import { toast } from 'react-toastify';
// import { FaPaperPlane, FaArrowLeft, FaCheckCircle, FaList, FaCircle } from 'react-icons/fa';

// const StudentLive = () => {
//   const { roomCode } = useParams();
//   const socket = useSocket();
//   const navigate = useNavigate();
  
//   const [polls, setPolls] = useState([]);
//   const [votedPolls, setVotedPolls] = useState([]);
//   const [whisperText, setWhisperText] = useState('');
//   const [reactions, setReactions] = useState([]); 
//   const [panicCooldown, setPanicCooldown] = useState(false); // NEW: Cooldown state

//   // Load voted polls
//   useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem(`voted_${roomCode}`)) || [];
//     setVotedPolls(saved);
//   }, [roomCode]);

//   // 1. FETCH DATA
//   const fetchPolls = useCallback(async () => {
//     try {
//       const res = await axios.get(`http://localhost:3000/api/polls/room/${roomCode}`);
//       let data = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
//       const activeList = data.filter(p => p.status !== 'closed');
//       setPolls(activeList);
//     } catch (err) {
//       console.error("Fetch error", err);
//     }
//   }, [roomCode]);

//   // 2. JOIN ROOM & LISTEN
//   useEffect(() => {
//     fetchPolls();
//     if(socket) socket.emit('join_room', roomCode);
//   }, [roomCode, socket, fetchPolls]);

//   // 3. SOCKET EVENTS
//   useEffect(() => {
//     if(!socket) return;
    
//     // Poll Updates
//     const handleUpdate = () => fetchPolls();
//     socket.on('poll_updated', handleUpdate);

//     // Reactions (To show them flying)
//     const handleReaction = (data) => {
//         setReactions(prev => [...prev, data]);
//         setTimeout(() => {
//             setReactions(prev => prev.filter(r => r.id !== data.id));
//         }, 2000);
//     };
//     socket.on('reaction_received', handleReaction);

//     return () => {
//         socket.off('poll_updated', handleUpdate);
//         socket.off('reaction_received', handleReaction);
//     };
//   }, [socket, fetchPolls]);

//   // --- ACTIONS ---
//   const handleVote = async (pollId, option) => {
//     try {
//       await axios.post(`http://localhost:3000/api/polls/${pollId}/vote`, { option });
//       toast.success("Vote Submitted!", { autoClose: 1500, hideProgressBar: true });
//       const newVotedList = [...votedPolls, pollId];
//       setVotedPolls(newVotedList);
//       localStorage.setItem(`voted_${roomCode}`, JSON.stringify(newVotedList));
//       fetchPolls();
//     } catch (err) {
//       toast.error("Vote failed.");
//     }
//   };

//   // --- UPDATED PANIC LOGIC (Prevents Spam) ---
//   const sendPanic = () => {
//     if (panicCooldown) return; // Block if cooling down

//     if (socket) {
//         socket.emit('panic_button', roomCode);
        
//         // Use toastId to prevent duplicate stacking
//         if (!toast.isActive('panic-toast')) {
//             toast.error("Signal sent!", { 
//                 icon: "🤯", 
//                 toastId: 'panic-toast',
//                 autoClose: 2000,
//                 hideProgressBar: true
//             });
//         }

//         // Activate visual cooldown
//         setPanicCooldown(true);
//         setTimeout(() => setPanicCooldown(false), 2000);
//     }
//   };
  
//   const sendWhisper = (e) => { 
//     e.preventDefault(); 
//     if(whisperText.trim() && socket) { 
//         socket.emit('whisper', { roomCode, message: whisperText }); 
//         setWhisperText(''); 
//         toast.info("Sent!", { icon: "🤫", autoClose: 1000, hideProgressBar: true }); 
//     }
//   };

//   const sendReaction = (emoji) => {
//     if(socket) socket.emit('reaction', { roomCode, emoji });
//   };

//   return (
//     <div className="flex flex-col min-h-screen p-4 pb-32 max-w-6xl mx-auto animate-slide-up relative overflow-hidden">
      
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <button onClick={() => navigate('/')} className="text-gray-400 text-sm flex items-center gap-2 hover:text-white transition"><FaArrowLeft /> Exit</button>
//         <div className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-blue-300 border border-white/10">ROOM: {roomCode}</div>
//       </div>

//       {/* --- GRID VIEW --- */}
//       <div className="animate-slide-up">
//         <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><FaList className="text-blue-500"/> Live Questions</h2>
        
//         {polls.length === 0 ? (
//             <div className="glass p-12 rounded-3xl text-center border-dashed border-2 border-white/10">
//                 <div className="text-4xl mb-4 opacity-50">💤</div>
//                 <p className="text-gray-400">Waiting for the host to start a poll...</p>
//             </div>
//         ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {polls.map(p => {
//                     const totalVotes = p.votes ? p.votes.reduce((a,b)=>a+b,0) : 0;
//                     const hasVotedOnThis = votedPolls.includes(p._id);

//                     return (
//                         <div key={p._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative group flex flex-col h-full">
//                             <div className="flex justify-between items-center mb-4">
//                                 <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-2 tracking-wider bg-green-100 text-green-700">
//                                     <FaCircle size={6} className="animate-pulse" /> LIVE
//                                 </span>
//                                 <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
//                                     {totalVotes} votes
//                                 </span>
//                             </div>
//                             <h3 className="font-bold text-gray-900 text-lg leading-snug mb-6">{p.question}</h3>
//                             <div className="space-y-2 mt-auto">
//                                 {!hasVotedOnThis ? (
//                                     p.options.map((opt, i) => (
//                                         <button key={i} onClick={() => handleVote(p._id, opt)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold border-2 border-gray-100 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95">
//                                             {opt}
//                                         </button>
//                                     ))
//                                 ) : (
//                                     p.options.map((opt, i) => {
//                                         const count = p.votes[i] || 0;
//                                         const pct = totalVotes ? Math.round((count/totalVotes)*100) : 0;
//                                         return (
//                                             <div key={i} className="mb-2">
//                                                 <div className="flex justify-between text-xs font-bold text-gray-500 mb-1"><span>{opt}</span><span>{pct}%</span></div>
//                                                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
//                                                     <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }}></div>
//                                                 </div>
//                                             </div>
//                                         )
//                                     })
//                                 )}
//                             </div>
//                             {hasVotedOnThis && <div className="mt-4 pt-3 border-t border-gray-100 text-center text-xs text-green-600 font-bold flex items-center justify-center gap-1"><FaCheckCircle /> You voted</div>}
//                         </div>
//                     );
//                 })}
//             </div>
//         )}
//       </div>

//       {/* --- FLOATING EMOJI LAYER --- */}
//       <div className="fixed bottom-0 right-4 w-24 h-screen pointer-events-none z-50 overflow-hidden">
//         {reactions.map((r) => (
//             <div 
//                 key={r.id}
//                 className="absolute bottom-0 text-5xl animate-float-up opacity-0"
//                 style={{ 
//                     left: `${Math.random() * 50}%`,
//                     animationDuration: `${1.5 + Math.random()}s`
//                 }}
//             >
//                 {r.emoji}
//             </div>
//         ))}
//       </div>

//       {/* --- ACTION BARS --- */}
//       <div className="fixed bottom-24 left-0 w-full flex justify-center gap-4 z-40 pointer-events-none">
//         <div className="bg-black/60 backdrop-blur-xl p-2 rounded-full border border-white/20 flex gap-3 pointer-events-auto shadow-2xl">
//             {['🔥', '😂', '👏', '❤️'].map(emoji => (
//                 <button key={emoji} onClick={() => sendReaction(emoji)} className="w-12 h-12 flex items-center justify-center text-2xl hover:scale-125 hover:bg-white/10 rounded-full transition active:scale-90">
//                     {emoji}
//                 </button>
//             ))}
//         </div>
//       </div>

//       {/* UPDATED PANIC BUTTON (With Cooldown UI) */}
//       <button 
//         onClick={sendPanic} 
//         disabled={panicCooldown}
//         className={`fixed bottom-40 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg backdrop-blur-md transition-all z-50 ${
//             panicCooldown 
//             ? 'bg-gray-500/20 border-2 border-gray-500 cursor-not-allowed opacity-50' 
//             : 'bg-red-500/20 border-2 border-red-500 active:scale-90 active:bg-red-600'
//         }`}
//       >
//         {panicCooldown ? '⏳' : '🤯'}
//       </button>
      
//       <div className="fixed bottom-0 left-0 w-full p-4 z-40 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent pt-12">
//         <form onSubmit={sendWhisper} className="max-w-md mx-auto glass rounded-full p-1 pl-5 flex items-center border border-white/20 shadow-2xl bg-black/40">
//           <input type="text" placeholder="Whisper..." className="bg-transparent text-sm text-white w-full outline-none placeholder-gray-500 py-3" value={whisperText} onChange={(e) => setWhisperText(e.target.value)} />
//           <button type="submit" className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm transition ml-2"><FaPaperPlane /></button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default StudentLive;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaArrowLeft, FaCheckCircle, FaCircle, FaGhost } from 'react-icons/fa';

const StudentLive = () => {
  const { roomCode } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  
  const [polls, setPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState([]);
  const [whisperText, setWhisperText] = useState('');
  const [reactions, setReactions] = useState([]); 
  const [panicCooldown, setPanicCooldown] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // --- 1. SESSION RECOVERY ---
  useEffect(() => {
    // Restore voted polls from local storage so they don't disappear on refresh
    const savedVotes = JSON.parse(localStorage.getItem(`voted_${roomCode}`)) || [];
    setVotedPolls(savedVotes);
  }, [roomCode]);

  // --- 2. FETCH DATA ---
  const fetchPolls = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/polls/room/${roomCode}`);
      let data = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      // Only show active polls
      const activeList = data.filter(p => p.status !== 'closed');
      setPolls(activeList);
    } catch (err) {
      console.error("Fetch error", err);
    }
  }, [roomCode]);

  // --- 3. SOCKET CONNECTION ---
  useEffect(() => {
    if(socket && roomCode) {
        socket.emit('join_room', roomCode);
        setIsConnected(true);
        fetchPolls();
    }
  }, [socket, roomCode, fetchPolls]);

  // --- 4. SOCKET LISTENERS ---
  useEffect(() => {
    if(!socket) return;
    
    // When the Host (or anyone) updates the poll, refresh immediately
    const handleUpdate = () => fetchPolls();
    
    const handleReaction = (data) => {
        setReactions(prev => [...prev, data]);
        setTimeout(() => setReactions(prev => prev.filter(r => r.id !== data.id)), 2000);
    };

    socket.on('poll_updated', handleUpdate);
    socket.on('reaction_received', handleReaction);

    return () => {
        socket.off('poll_updated', handleUpdate);
        socket.off('reaction_received', handleReaction);
    };
  }, [socket, fetchPolls]);

  // --- ACTIONS ---
  const handleVote = async (pollId, option) => {
    // 1. Optimistic Update (Make it feel instant)
    const newVotedList = [...votedPolls, pollId];
    setVotedPolls(newVotedList);
    localStorage.setItem(`voted_${roomCode}`, JSON.stringify(newVotedList));

    try {
      // 2. Send to Server
      await axios.post(`http://localhost:3000/api/polls/${pollId}/vote`, { option });
      // 3. Fetch latest numbers (Socket will also trigger this, but double check is good)
      fetchPolls();
    } catch (err) {
      toast.error("Vote failed.");
      // Revert if failed
      setVotedPolls(prev => prev.filter(id => id !== pollId));
    }
  };

  const sendPanic = () => {
    if (panicCooldown) return; 

    if (socket) {
        socket.emit('panic_button', roomCode);
        setPanicCooldown(true);
        setTimeout(() => setPanicCooldown(false), 5000);
    }
  };
  
  const sendWhisper = (e) => { 
    e.preventDefault(); 
    if(whisperText.trim() && socket) { 
        socket.emit('whisper', { roomCode, message: whisperText }); 
        setWhisperText(''); 
    }
  };

  const sendReaction = (emoji) => {
    if(socket) socket.emit('reaction', { roomCode, emoji });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#030303] text-white p-4 pb-32 relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="relative z-10 flex justify-between items-center mb-8 border-b border-[#333] pb-4">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-[#ccff00] text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition">
            <FaArrowLeft /> Exit
        </button>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#ccff00] animate-pulse' : 'bg-red-500'}`}></div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">SESSION: <span className="text-white">{roomCode}</span></div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="relative z-10 max-w-2xl mx-auto w-full">
        
        {polls.length === 0 ? (
            <div className="border border-dashed border-[#333] p-12 rounded-xl text-center bg-[#0a0a0a]">
                <div className="text-4xl mb-4 animate-bounce">📡</div>
                <h2 className="text-xl font-bold text-white mb-2">Signal Acquired</h2>
                <p className="text-gray-500 font-mono text-sm">Waiting for incoming transmission...</p>
            </div>
        ) : (
            <div className="space-y-6">
                {polls.map(p => {
                    const totalVotes = p.votes ? p.votes.reduce((a,b)=>a+b,0) : 0;
                    const hasVotedOnThis = votedPolls.includes(p._id);

                    return (
                        <div key={p._id} className="bg-[#0a0a0a] rounded-xl p-6 border border-[#333] shadow-2xl relative animate-slide-up">
                            {/* LIVE BADGE */}
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-mono font-bold uppercase px-2 py-1 border border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10 flex items-center gap-2 tracking-widest">
                                    <FaCircle size={6} className="animate-pulse" /> LIVE
                                </span>
                            </div>

                            {/* QUESTION */}
                            <h3 className="font-bold text-white text-xl leading-tight mb-8">{p.question}</h3>
                            
                            {/* OPTIONS */}
                            <div className="space-y-3">
                                {!hasVotedOnThis ? (
                                    p.options.map((opt, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleVote(p._id, opt)} 
                                            className="w-full text-left px-5 py-4 rounded bg-[#111] border border-[#333] text-gray-300 font-bold hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all active:scale-[0.98]"
                                        >
                                            <span className="mr-3 opacity-50 font-mono">{String.fromCharCode(65 + i)}.</span> {opt}
                                        </button>
                                    ))
                                ) : (
                                    p.options.map((opt, i) => {
                                        const count = p.votes[i] || 0;
                                        const pct = totalVotes ? Math.round((count/totalVotes)*100) : 0;
                                        return (
                                            <div key={i} className="mb-4">
                                                <div className="flex justify-between text-xs font-mono font-bold text-gray-500 mb-2">
                                                    <span>{opt}</span>
                                                    <span>{pct}%</span>
                                                </div>
                                                <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[#ccff00] transition-all duration-700 ease-out" 
                                                        style={{ width: `${pct}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {hasVotedOnThis && (
                                <div className="mt-6 pt-4 border-t border-[#222] text-center">
                                    <span className="text-xs font-mono uppercase text-gray-500 flex items-center justify-center gap-2">
                                        <FaCheckCircle className="text-[#ccff00]" /> Transmission Sent
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* --- FLOATING EMOJIS --- */}
      <div className="fixed bottom-0 right-4 w-24 h-screen pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => (
            <div key={r.id} className="absolute bottom-0 text-5xl animate-float-up opacity-0" style={{ left: `${Math.random() * 50}%`, animationDuration: `${1.5 + Math.random()}s` }}>{r.emoji}</div>
        ))}
      </div>

      {/* --- BOTTOM CONTROLS --- */}
      <div className="fixed bottom-0 left-0 w-full z-40">
        
        {/* REACTION BAR */}
        <div className="absolute bottom-24 w-full flex justify-center pointer-events-none">
             <div className="bg-[#111]/90 backdrop-blur border border-[#333] p-2 rounded-full flex gap-4 pointer-events-auto shadow-2xl">
                {['🔥', '😂', '👏', '❤️'].map(emoji => (
                    <button key={emoji} onClick={() => sendReaction(emoji)} className="w-10 h-10 flex items-center justify-center text-xl hover:scale-125 hover:bg-white/10 rounded-full transition active:scale-90">
                        {emoji}
                    </button>
                ))}
            </div>
        </div>

        {/* PANIC BUTTON */}
        <button 
            onClick={sendPanic} 
            disabled={panicCooldown}
            className={`fixed bottom-36 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all z-50 ${
                panicCooldown 
                ? 'bg-[#222] border border-[#444] text-gray-500 cursor-not-allowed' 
                : 'bg-red-900/80 border border-red-500 text-red-500 hover:bg-red-600 hover:text-white active:scale-90'
            }`}
        >
            {panicCooldown ? <span className="text-xs font-mono">{5}s</span> : <FaGhost />}
        </button>
        
        {/* WHISPER INPUT */}
        <div className="w-full bg-[#0a0a0a] border-t border-[#333] p-4 pb-8 safe-area-bottom">
            <form onSubmit={sendWhisper} className="max-w-2xl mx-auto flex gap-3">
                <input 
                    type="text" 
                    placeholder="Send a whisper to the host..." 
                    className="flex-1 bg-[#111] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#ccff00] placeholder-gray-600 font-mono text-sm transition-colors" 
                    value={whisperText} 
                    onChange={(e) => setWhisperText(e.target.value)} 
                />
                <button 
                    type="submit" 
                    className="bg-[#ccff00] hover:bg-white text-black px-6 rounded font-bold transition-colors flex items-center justify-center"
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default StudentLive;