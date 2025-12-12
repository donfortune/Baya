import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaArrowLeft, FaCheckCircle, FaList, FaCircle } from 'react-icons/fa';

const StudentLive = () => {
  const { roomCode } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  
  const [polls, setPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState([]);
  const [whisperText, setWhisperText] = useState('');

  // Load voted polls
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`voted_${roomCode}`)) || [];
    setVotedPolls(saved);
  }, [roomCode]);

  // 1. FETCH DATA
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

  // 2. JOIN ROOM
  useEffect(() => {
    fetchPolls();
    if(socket) socket.emit('join_room', roomCode);
  }, [roomCode, socket, fetchPolls]);

  // 3. LISTEN FOR UPDATES
  useEffect(() => {
    if(!socket) return;
    const handleUpdate = () => fetchPolls();
    socket.on('poll_updated', handleUpdate);
    return () => socket.off('poll_updated', handleUpdate);
  }, [socket, fetchPolls]);

  // --- ACTIONS ---
  const handleVote = async (pollId, option) => {
    try {
      await axios.post(`http://localhost:3000/api/polls/${pollId}/vote`, { option });
      toast.success("Vote Submitted!");
      const newVotedList = [...votedPolls, pollId];
      setVotedPolls(newVotedList);
      localStorage.setItem(`voted_${roomCode}`, JSON.stringify(newVotedList));
      fetchPolls();
    } catch (err) {
      toast.error("Vote failed.");
    }
  };

  const sendPanic = () => { if(socket) { socket.emit('panic_button', roomCode); toast.error("Signal sent!", { icon: "🤯" }); }};
  
  const sendWhisper = (e) => { 
    e.preventDefault(); 
    if(whisperText.trim() && socket) { 
        socket.emit('whisper', { roomCode, message: whisperText }); 
        setWhisperText(''); 
        toast.info("Sent!", { icon: "🤫" }); 
    }
  };

  // --- NEW: SEND REACTION ---
  const sendReaction = (emoji) => {
    if(socket) {
        socket.emit('reaction', { roomCode, emoji });
        // Tiny visual feedback for the student
        toast(emoji, { 
            position: "bottom-center", 
            autoClose: 500, 
            hideProgressBar: true, 
            closeButton: false, 
            className: "bg-transparent shadow-none text-4xl"
        });
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 pb-32 max-w-6xl mx-auto animate-slide-up">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 text-sm flex items-center gap-2 hover:text-white transition"><FaArrowLeft /> Exit</button>
        <div className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-blue-300 border border-white/10">ROOM: {roomCode}</div>
      </div>

      {/* --- GRID VIEW --- */}
      <div className="animate-slide-up">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><FaList className="text-blue-500"/> Live Questions</h2>
        
        {polls.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center border-dashed border-2 border-white/10">
                <div className="text-4xl mb-4 opacity-50">💤</div>
                <p className="text-gray-400">Waiting for the host to start a poll...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map(p => {
                    const totalVotes = p.votes ? p.votes.reduce((a,b)=>a+b,0) : 0;
                    const hasVotedOnThis = votedPolls.includes(p._id);

                    return (
                        <div key={p._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative group flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-2 tracking-wider bg-green-100 text-green-700">
                                    <FaCircle size={6} className="animate-pulse" /> LIVE
                                </span>
                                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                    {totalVotes} votes
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg leading-snug mb-6">{p.question}</h3>
                            <div className="space-y-2 mt-auto">
                                {!hasVotedOnThis ? (
                                    p.options.map((opt, i) => (
                                        <button key={i} onClick={() => handleVote(p._id, opt)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold border-2 border-gray-100 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95">
                                            {opt}
                                        </button>
                                    ))
                                ) : (
                                    p.options.map((opt, i) => {
                                        const count = p.votes[i] || 0;
                                        const pct = totalVotes ? Math.round((count/totalVotes)*100) : 0;
                                        return (
                                            <div key={i} className="mb-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1"><span>{opt}</span><span>{pct}%</span></div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                            {hasVotedOnThis && <div className="mt-4 pt-3 border-t border-gray-100 text-center text-xs text-green-600 font-bold flex items-center justify-center gap-1"><FaCheckCircle /> You voted</div>}
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* --- FLOATING EMOJI BAR (NEW) --- */}
      <div className="fixed bottom-24 left-0 w-full flex justify-center gap-4 z-40 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl p-2 rounded-full border border-white/20 flex gap-3 pointer-events-auto shadow-2xl">
            {['🔥', '😂', '👏', '❤️'].map(emoji => (
                <button 
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="w-12 h-12 flex items-center justify-center text-2xl hover:scale-125 hover:bg-white/10 rounded-full transition active:scale-90"
                >
                    {emoji}
                </button>
            ))}
        </div>
      </div>

      {/* PANIC & WHISPER TOOLS */}
      <button onClick={sendPanic} className="fixed bottom-40 right-6 w-14 h-14 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center text-2xl shadow-lg backdrop-blur-md active:scale-90 active:bg-red-600 transition-all z-50">🤯</button>
      
      <div className="fixed bottom-0 left-0 w-full p-4 z-40 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent pt-12">
        <form onSubmit={sendWhisper} className="max-w-md mx-auto glass rounded-full p-1 pl-5 flex items-center border border-white/20 shadow-2xl bg-black/40">
          <input type="text" placeholder="Whisper..." className="bg-transparent text-sm text-white w-full outline-none placeholder-gray-500 py-3" value={whisperText} onChange={(e) => setWhisperText(e.target.value)} />
          <button type="submit" className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm transition ml-2"><FaPaperPlane /></button>
        </form>
      </div>
    </div>
  );
};

export default StudentLive;