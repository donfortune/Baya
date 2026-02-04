// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useSocket } from '../context/SocketContext';
// import { toast } from 'react-toastify';
// import { FaPaperPlane, FaArrowLeft, FaCheckCircle, FaCircle, FaGhost } from 'react-icons/fa';

// const StudentLive = () => {
//   const { roomCode } = useParams();
//   const socket = useSocket();
//   const navigate = useNavigate();
  
//   const [polls, setPolls] = useState([]);
//   const [votedPolls, setVotedPolls] = useState([]);
//   const [whisperText, setWhisperText] = useState('');
//   const [reactions, setReactions] = useState([]); 
//   const [panicCooldown, setPanicCooldown] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);

//   // --- 1. SESSION RECOVERY ---
//   useEffect(() => {
//     // Restore voted polls from local storage so they don't disappear on refresh
//     const savedVotes = JSON.parse(localStorage.getItem(`voted_${roomCode}`)) || [];
//     setVotedPolls(savedVotes);
//   }, [roomCode]);

//   // --- 2. FETCH DATA ---
//   const fetchPolls = useCallback(async () => {
//     try {
//       const res = await axios.get(`http://localhost:3000/api/polls/room/${roomCode}`);
//       let data = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
//       // Only show active polls
//       const activeList = data.filter(p => p.status !== 'closed');
//       setPolls(activeList);
//     } catch (err) {
//       console.error("Fetch error", err);
//     }
//   }, [roomCode]);

//   // --- 3. SOCKET CONNECTION ---
//   useEffect(() => {
//     if(socket && roomCode) {
//         socket.emit('join_room', roomCode);
//         setIsConnected(true);
//         fetchPolls();
//     }
//   }, [socket, roomCode, fetchPolls]);

//   // --- 4. SOCKET LISTENERS ---
//   useEffect(() => {
//     if(!socket) return;
    
//     // When the Host (or anyone) updates the poll, refresh immediately
//     const handleUpdate = () => fetchPolls();
    
//     const handleReaction = (data) => {
//         setReactions(prev => [...prev, data]);
//         setTimeout(() => setReactions(prev => prev.filter(r => r.id !== data.id)), 2000);
//     };

//     socket.on('poll_updated', handleUpdate);
//     socket.on('reaction_received', handleReaction);

//     return () => {
//         socket.off('poll_updated', handleUpdate);
//         socket.off('reaction_received', handleReaction);
//     };
//   }, [socket, fetchPolls]);

//   // --- ACTIONS ---
//   const handleVote = async (pollId, option) => {
//     // 1. Optimistic Update (Make it feel instant)
//     const newVotedList = [...votedPolls, pollId];
//     setVotedPolls(newVotedList);
//     localStorage.setItem(`voted_${roomCode}`, JSON.stringify(newVotedList));

//     try {
//       // 2. Send to Server
//       await axios.post(`http://localhost:3000/api/polls/${pollId}/vote`, { option });
//       // 3. Fetch latest numbers (Socket will also trigger this, but double check is good)
//       fetchPolls();
//     } catch (err) {
//       toast.error("Vote failed.");
//       // Revert if failed
//       setVotedPolls(prev => prev.filter(id => id !== pollId));
//     }
//   };

//   const sendPanic = () => {
//     if (panicCooldown) return; 

//     if (socket) {
//         socket.emit('panic_button', roomCode);
//         setPanicCooldown(true);
//         setTimeout(() => setPanicCooldown(false), 5000);
//     }
//   };
  
//   const sendWhisper = (e) => { 
//     e.preventDefault(); 
//     if(whisperText.trim() && socket) { 
//         socket.emit('whisper', { roomCode, message: whisperText }); 
//         setWhisperText(''); 
//     }
//   };

//   const sendReaction = (emoji) => {
//     if(socket) socket.emit('reaction', { roomCode, emoji });
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-[#030303] text-white p-4 pb-32 relative overflow-hidden font-sans">
      
//       {/* HEADER */}
//       <div className="relative z-10 flex justify-between items-center mb-8 border-b border-[#333] pb-4">
//         <button onClick={() => navigate('/')} className="text-gray-500 hover:text-[#ccff00] text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition">
//             <FaArrowLeft /> Exit
//         </button>
//         <div className="flex items-center gap-2">
//             <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#ccff00] animate-pulse' : 'bg-red-500'}`}></div>
//             <div className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">SESSION: <span className="text-white">{roomCode}</span></div>
//         </div>
//       </div>

//       {/* --- CONTENT AREA --- */}
//       <div className="relative z-10 max-w-2xl mx-auto w-full">
        
//         {polls.length === 0 ? (
//             <div className="border border-dashed border-[#333] p-12 rounded-xl text-center bg-[#0a0a0a]">
//                 <div className="text-4xl mb-4 animate-bounce">📡</div>
//                 <h2 className="text-xl font-bold text-white mb-2">Signal Acquired</h2>
//                 <p className="text-gray-500 font-mono text-sm">Waiting for incoming transmission...</p>
//             </div>
//         ) : (
//             <div className="space-y-6">
//                 {polls.map(p => {
//                     const totalVotes = p.votes ? p.votes.reduce((a,b)=>a+b,0) : 0;
//                     const hasVotedOnThis = votedPolls.includes(p._id);

//                     return (
//                         <div key={p._id} className="bg-[#0a0a0a] rounded-xl p-6 border border-[#333] shadow-2xl relative animate-slide-up">
//                             {/* LIVE BADGE */}
//                             <div className="flex justify-between items-start mb-6">
//                                 <span className="text-[10px] font-mono font-bold uppercase px-2 py-1 border border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10 flex items-center gap-2 tracking-widest">
//                                     <FaCircle size={6} className="animate-pulse" /> LIVE
//                                 </span>
//                             </div>

//                             {/* QUESTION */}
//                             <h3 className="font-bold text-white text-xl leading-tight mb-8">{p.question}</h3>
                            
//                             {/* OPTIONS */}
//                             <div className="space-y-3">
//                                 {!hasVotedOnThis ? (
//                                     p.options.map((opt, i) => (
//                                         <button 
//                                             key={i} 
//                                             onClick={() => handleVote(p._id, opt)} 
//                                             className="w-full text-left px-5 py-4 rounded bg-[#111] border border-[#333] text-gray-300 font-bold hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all active:scale-[0.98]"
//                                         >
//                                             <span className="mr-3 opacity-50 font-mono">{String.fromCharCode(65 + i)}.</span> {opt}
//                                         </button>
//                                     ))
//                                 ) : (
//                                     p.options.map((opt, i) => {
//                                         const count = p.votes[i] || 0;
//                                         const pct = totalVotes ? Math.round((count/totalVotes)*100) : 0;
//                                         return (
//                                             <div key={i} className="mb-4">
//                                                 <div className="flex justify-between text-xs font-mono font-bold text-gray-500 mb-2">
//                                                     <span>{opt}</span>
//                                                     <span>{pct}%</span>
//                                                 </div>
//                                                 <div className="h-2 bg-[#222] rounded-full overflow-hidden">
//                                                     <div 
//                                                         className="h-full bg-[#ccff00] transition-all duration-700 ease-out" 
//                                                         style={{ width: `${pct}%` }}
//                                                     ></div>
//                                                 </div>
//                                             </div>
//                                         )
//                                     })
//                                 )}
//                             </div>

//                             {hasVotedOnThis && (
//                                 <div className="mt-6 pt-4 border-t border-[#222] text-center">
//                                     <span className="text-xs font-mono uppercase text-gray-500 flex items-center justify-center gap-2">
//                                         <FaCheckCircle className="text-[#ccff00]" /> Transmission Sent
//                                     </span>
//                                 </div>
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>
//         )}
//       </div>

//       {/* --- FLOATING EMOJIS --- */}
//       <div className="fixed bottom-0 right-4 w-24 h-screen pointer-events-none z-50 overflow-hidden">
//         {reactions.map((r) => (
//             <div key={r.id} className="absolute bottom-0 text-5xl animate-float-up opacity-0" style={{ left: `${Math.random() * 50}%`, animationDuration: `${1.5 + Math.random()}s` }}>{r.emoji}</div>
//         ))}
//       </div>

//       {/* --- BOTTOM CONTROLS --- */}
//       <div className="fixed bottom-0 left-0 w-full z-40">
        
//         {/* REACTION BAR */}
//         <div className="absolute bottom-24 w-full flex justify-center pointer-events-none">
//              <div className="bg-[#111]/90 backdrop-blur border border-[#333] p-2 rounded-full flex gap-4 pointer-events-auto shadow-2xl">
//                 {['🔥', '😂', '👏', '❤️'].map(emoji => (
//                     <button key={emoji} onClick={() => sendReaction(emoji)} className="w-10 h-10 flex items-center justify-center text-xl hover:scale-125 hover:bg-white/10 rounded-full transition active:scale-90">
//                         {emoji}
//                     </button>
//                 ))}
//             </div>
//         </div>

//         {/* PANIC BUTTON */}
//         <button 
//             onClick={sendPanic} 
//             disabled={panicCooldown}
//             className={`fixed bottom-36 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all z-50 ${
//                 panicCooldown 
//                 ? 'bg-[#222] border border-[#444] text-gray-500 cursor-not-allowed' 
//                 : 'bg-red-900/80 border border-red-500 text-red-500 hover:bg-red-600 hover:text-white active:scale-90'
//             }`}
//         >
//             {panicCooldown ? <span className="text-xs font-mono">{5}s</span> : <FaGhost />}
//         </button>
        
//         {/* WHISPER INPUT */}
//         <div className="w-full bg-[#0a0a0a] border-t border-[#333] p-4 pb-8 safe-area-bottom">
//             <form onSubmit={sendWhisper} className="max-w-2xl mx-auto flex gap-3">
//                 <input 
//                     type="text" 
//                     placeholder="Send a whisper to the host..." 
//                     className="flex-1 bg-[#111] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#ccff00] placeholder-gray-600 font-mono text-sm transition-colors" 
//                     value={whisperText} 
//                     onChange={(e) => setWhisperText(e.target.value)} 
//                 />
//                 <button 
//                     type="submit" 
//                     className="bg-[#ccff00] hover:bg-white text-black px-6 rounded font-bold transition-colors flex items-center justify-center"
//                 >
//                     <FaPaperPlane />
//                 </button>
//             </form>
//         </div>
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
import { FaPaperPlane, FaArrowLeft, FaCheckCircle, FaCircle, FaGhost, FaIdCard } from 'react-icons/fa';

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
  
  // 👇 NEW: Identity State
  const [studentId, setStudentId] = useState(''); 
  const [showIdModal, setShowIdModal] = useState(false);
  const [pendingVote, setPendingVote] = useState(null); // Remembers what they tried to vote for

  // --- 1. SESSION RECOVERY ---
  useEffect(() => {
    const savedVotes = JSON.parse(localStorage.getItem(`voted_${roomCode}`)) || [];
    setVotedPolls(savedVotes);
    
    // Check if they already entered an ID for this room session
    const savedId = localStorage.getItem(`identity_${roomCode}`);
    if (savedId) setStudentId(savedId);
  }, [roomCode]);

  // --- 2. FETCH DATA ---
  const fetchPolls = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/polls/room/${roomCode}`);
      let data = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
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

  useEffect(() => {
    if(!socket) return;
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
  
  const initiateVote = (poll, option) => {
    // 🔒 If Poll is Strict AND we don't have an ID yet
    if (poll.isStrict && !studentId) {
        setPendingVote({ pollId: poll._id, option });
        setShowIdModal(true);
        return;
    }
    // Otherwise, proceed
    submitVote(poll._id, option, studentId);
  };

  const submitVote = async (pollId, option, idToUse) => {
    // Optimistic Update
    const newVotedList = [...votedPolls, pollId];
    setVotedPolls(newVotedList);
    localStorage.setItem(`voted_${roomCode}`, JSON.stringify(newVotedList));

    try {
      // Send Vote + StudentID (if applicable)
      await axios.post(`http://localhost:3000/api/polls/${pollId}/vote`, { 
        option, 
        studentId: idToUse 
      });
      fetchPolls();
    } catch (err) {
      // Handle Specific Backend Errors (e.g., "Duplicate Vote")
      if (err.response && err.response.status === 403) {
          toast.error("⛔ ID REJECTED: You have already voted.");
      } else {
          toast.error("Vote failed.");
      }
      setVotedPolls(prev => prev.filter(id => id !== pollId));
    }
  };

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    
    // Save ID for future votes in this room
    localStorage.setItem(`identity_${roomCode}`, studentId);
    setShowIdModal(false);
    
    // If they were trying to vote, retry automatically
    if (pendingVote) {
        submitVote(pendingVote.pollId, pendingVote.option, studentId);
        setPendingVote(null);
    }
  };

  const sendPanic = () => { /* ... existing panic logic ... */ 
    if (panicCooldown) return; 
    if (socket) { socket.emit('panic_button', roomCode); setPanicCooldown(true); setTimeout(() => setPanicCooldown(false), 5000); }
  };
  
  const sendWhisper = (e) => { /* ... existing whisper logic ... */ 
    e.preventDefault(); if(whisperText.trim() && socket) { socket.emit('whisper', { roomCode, message: whisperText }); setWhisperText(''); }
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
                            {/* BADGES */}
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-mono font-bold uppercase px-2 py-1 border border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10 flex items-center gap-2 tracking-widest">
                                    <FaCircle size={6} className="animate-pulse" /> LIVE
                                </span>
                                {p.isStrict && (
                                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-1 border border-blue-500 text-blue-400 bg-blue-900/20 flex items-center gap-2 tracking-widest">
                                        <FaIdCard /> STRICT
                                    </span>
                                )}
                            </div>

                            <h3 className="font-bold text-white text-xl leading-tight mb-8">{p.question}</h3>
                            
                            <div className="space-y-3">
                                {!hasVotedOnThis ? (
                                    p.options.map((opt, i) => (
                                        <button 
                                            key={i} 
                                            // 👇 CHANGE: Call initiateVote instead of direct submit
                                            onClick={() => initiateVote(p, opt)} 
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
                                                    <div className="h-full bg-[#ccff00] transition-all duration-700 ease-out" style={{ width: `${pct}%` }}></div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                            {hasVotedOnThis && <div className="mt-6 pt-4 border-t border-[#222] text-center"><span className="text-xs font-mono uppercase text-gray-500 flex items-center justify-center gap-2"><FaCheckCircle className="text-[#ccff00]" /> Transmission Sent</span></div>}
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* --- FLOATING EMOJIS & CONTROLS (Same as before) --- */}
      <div className="fixed bottom-0 right-4 w-24 h-screen pointer-events-none z-50 overflow-hidden">{reactions.map((r) => <div key={r.id} className="absolute bottom-0 text-5xl animate-float-up opacity-0" style={{ left: `${Math.random() * 50}%`, animationDuration: `${1.5 + Math.random()}s` }}>{r.emoji}</div>)}</div>
      
      <div className="fixed bottom-0 left-0 w-full z-40">
        <div className="absolute bottom-24 w-full flex justify-center pointer-events-none">
             <div className="bg-[#111]/90 backdrop-blur border border-[#333] p-2 rounded-full flex gap-4 pointer-events-auto shadow-2xl">
                {['🔥', '😂', '👏', '❤️'].map(emoji => (
                    <button key={emoji} onClick={() => sendReaction(emoji)} className="w-10 h-10 flex items-center justify-center text-xl hover:scale-125 hover:bg-white/10 rounded-full transition active:scale-90">{emoji}</button>
                ))}
            </div>
        </div>
        <button onClick={sendPanic} disabled={panicCooldown} className={`fixed bottom-36 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all z-50 ${panicCooldown ? 'bg-[#222] border border-[#444] text-gray-500 cursor-not-allowed' : 'bg-red-900/80 border border-red-500 text-red-500 hover:bg-red-600 hover:text-white active:scale-90'}`}>{panicCooldown ? <span className="text-xs font-mono">{5}s</span> : <FaGhost />}</button>
        <div className="w-full bg-[#0a0a0a] border-t border-[#333] p-4 pb-8 safe-area-bottom">
            <form onSubmit={sendWhisper} className="max-w-2xl mx-auto flex gap-3">
                <input type="text" placeholder="Send a whisper to the host..." className="flex-1 bg-[#111] border border-[#333] text-white px-4 py-3 rounded focus:outline-none focus:border-[#ccff00] placeholder-gray-600 font-mono text-sm transition-colors" value={whisperText} onChange={(e) => setWhisperText(e.target.value)} />
                <button type="submit" className="bg-[#ccff00] hover:bg-white text-black px-6 rounded font-bold transition-colors flex items-center justify-center"><FaPaperPlane /></button>
            </form>
        </div>
      </div>

      {/* 👇 NEW: IDENTITY MODAL (The PVC Check) */}
      {showIdModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#0a0a0a] border border-[#333] p-6 rounded-xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.7)]">
                  <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-blue-900/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-800">
                          <FaIdCard size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Identity Required</h3>
                      <p className="text-sm text-gray-500 mt-1">This is a strict election poll. Please enter your Student ID to cast your vote.</p>
                  </div>
                  <form onSubmit={handleIdSubmit}>
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Enter Student ID (e.g. 19/1234)" 
                        className="w-full bg-[#111] border border-[#333] p-3 text-white text-center font-mono font-bold focus:border-blue-500 outline-none rounded mb-4 uppercase"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                      />
                      <div className="flex gap-3">
                          <button type="button" onClick={() => setShowIdModal(false)} className="flex-1 py-3 text-gray-500 hover:text-white font-mono text-xs uppercase">Cancel</button>
                          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded shadow-[0_0_15px_rgba(37,99,235,0.3)]">CONFIRM ID</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default StudentLive;