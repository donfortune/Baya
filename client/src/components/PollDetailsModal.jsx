import React from 'react';
import { FaTimes, FaBroadcastTower, FaHistory, FaQuoteRight, FaVoteYea, FaRegClock } from 'react-icons/fa';

const PollDetailsModal = ({ poll, isOpen, onClose, liveWhispers = [] }) => {
  if (!isOpen || !poll) return null;

  const isActive = poll.status === 'active';
  const totalVotes = poll.votes ? poll.votes.reduce((a, b) => a + b, 0) : 0;
  
  // Format Date
  const dateStr = new Date(poll.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP BLUR */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* MODAL CONTENT */}
      <div className="relative bg-[#0a0a0a] border border-[#333] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col animate-scale-up">
        
        {/* HEADER */}
        <div className="flex justify-between items-start p-6 border-b border-[#222] bg-[#111]">
            <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border mb-3 rounded-full ${isActive ? 'border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10 animate-pulse' : 'border-gray-600 text-gray-500 bg-gray-900'}`}>
                    {isActive ? <><FaBroadcastTower /> Live Transmission</> : <><FaHistory /> Archived Log</>}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{poll.question}</h2>
                <div className="flex items-center gap-4 mt-2 text-gray-500 text-xs font-mono">
                    <span className="flex items-center gap-1"><FaRegClock /> {dateStr}</span>
                    <span className="text-[#333]">|</span>
                    <span>ID: {poll.roomCode}</span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full text-gray-400 hover:text-white transition">
                <FaTimes size={24} />
            </button>
        </div>

        {/* BODY - SPLIT VIEW */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* LEFT: RESULTS (2 Cols wide) */}
            <div className="md:col-span-2 space-y-8">
                <div>
                    <h3 className="text-sm font-mono text-[#ccff00] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FaVoteYea /> Voting Analysis
                    </h3>
                    
                    <div className="space-y-5">
                        {poll.options.map((opt, i) => {
                            const votes = poll.votes ? poll.votes[i] : 0;
                            const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
                            
                            return (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-2">
                                        <span>{opt}</span>
                                        <span className="font-mono text-[#ccff00]">{percentage}% ({votes})</span>
                                    </div>
                                    <div className="h-4 w-full bg-[#1a1a1a] rounded-full overflow-hidden border border-[#333]">
                                        <div 
                                            className={`h-full transition-all duration-1000 ease-out ${isActive ? 'bg-gradient-to-r from-[#ccff00] to-green-400' : 'bg-gray-600'}`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* METRICS */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#111] p-4 rounded border border-[#222] text-center">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total Votes</div>
                        <div className="text-3xl font-mono text-white">{totalVotes}</div>
                    </div>
                    <div className="bg-[#111] p-4 rounded border border-[#222] text-center">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Leading Option</div>
                        <div className="text-lg font-bold text-[#ccff00] truncate">
                            {poll.options[poll.votes.indexOf(Math.max(...poll.votes))] || '-'}
                        </div>
                    </div>
                    <div className="bg-[#111] p-4 rounded border border-[#222] text-center">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Engagement</div>
                        <div className="text-lg font-bold text-white">{totalVotes > 0 ? 'High' : 'None'}</div>
                    </div>
                </div>
            </div>

            {/* RIGHT: SESSION INTEL (1 Col wide) */}
            <div className="border-l border-[#222] pl-0 md:pl-8">
                <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaQuoteRight /> Whisper Log
                </h3>

                <div className="bg-[#050505] border border-[#222] rounded-lg h-[300px] overflow-hidden flex flex-col">
                    {/* If Active, show live whispers. If Archived, show empty state (unless we add DB persistence later) */}
                    {isActive ? (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                             {liveWhispers.length === 0 && <span className="text-gray-700 italic">// No data stream...</span>}
                             {liveWhispers.map((w, index) => (
                                <div key={index} className="text-cyan-200 border-l-2 border-cyan-800 pl-2">
                                    <span className="text-cyan-600 opacity-50 mr-2">{'>'}</span> {w}
                                </div>
                             ))}
                        </div>
                    ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-gray-700 text-center p-4">
                            <FaHistory className="text-2xl mb-2 opacity-20" />
                            <p className="text-xs">Whisper logs were not saved for this session.</p>
                         </div>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Access Code</h3>
                    <div className="bg-[#111] border border-[#333] p-4 rounded text-center">
                        <span className="text-4xl font-mono font-black text-white tracking-widest">{poll.roomCode}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetailsModal;