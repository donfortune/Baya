// import axios from 'axios';
// import { FaCircle } from 'react-icons/fa';

// const PollCard = ({ poll }) => {
//   const totalVotes = poll.votes ? poll.votes.reduce((a, b) => a + b, 0) : 0;
//   const isActive = poll.status === 'active';

//   const toggleStatus = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const newStatus = isActive ? 'closed' : 'active';
//       const pollId = poll._id || poll.pollId;

//       await axios.patch(`http://localhost:3000/api/polls/${pollId}/status`, 
//         { status: newStatus }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     } catch (error) {
//       console.error("Toggle Status Failed");
//     }
//   };

//   return (
//     <div className={`rounded-2xl p-6 border transition-all duration-300 relative group flex flex-col h-full ${isActive ? 'bg-white border-blue-500/30 shadow-lg shadow-blue-500/5' : 'bg-slate-50 border-gray-200 opacity-75 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}>
      
//       {/* Header: Status & Toggle */}
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-2">
//           <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
//           <span className={`text-xs font-bold tracking-wider uppercase ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
//             {isActive ? 'Live' : 'Closed'}
//           </span>
//         </div>

//         {/* Toggle Switch */}
//         <button 
//           onClick={toggleStatus}
//           className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
//           title={isActive ? "Click to Close" : "Click to Open"}
//         >
//           <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></span>
//         </button>
//       </div>

//       {/* Question */}
//       <h3 className="font-bold text-gray-800 text-lg leading-snug mb-6 flex-grow">{poll.question}</h3>

//       {/* Options Bars */}
//       <div className="space-y-4 mb-2">
//         {poll.options.slice(0, 3).map((opt, i) => {
//           const voteCount = poll.votes[i] || 0;
//           const percentage = totalVotes ? Math.round((voteCount / totalVotes) * 100) : 0;
          
//           return (
//             <div key={i} className="relative">
//               <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1 z-10 relative">
//                 <span>{opt}</span>
//                 <span>{percentage}%</span>
//               </div>
//               <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
//                 <div 
//                   className={`h-full transition-all duration-700 ease-out ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`} 
//                   style={{ width: `${percentage}%` }}
//                 ></div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
      
//       {/* Footer (ID REMOVED) */}
//       <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end items-center text-xs text-gray-400 font-mono">
//         <span><i className="fa-solid fa-user-group mr-1"></i> {totalVotes} Votes</span>
//       </div>
//     </div>
//   );
// };

// export default PollCard;

import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaStopCircle, FaCheckCircle, FaVoteYea } from 'react-icons/fa';

const PollCard = ({ poll }) => {
  const totalVotes = poll.votes ? poll.votes.reduce((a, b) => a + b, 0) : 0;
  const isActive = poll.status === 'active';

  // --- ACTIONS ---
  const closePoll = async () => {
    try {
      await axios.patch(`http://localhost:3000/api/polls/${poll._id}/status`, { status: 'closed' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.info("POLL CLOSED");
    } catch (e) { toast.error("Error closing poll"); }
  };

  const deletePoll = async () => {
    if(!window.confirm("Delete this poll?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/polls/${poll._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("POLL DELETED");
      window.location.reload(); // Simple refresh to clear UI
    } catch (e) { toast.error("Error deleting poll"); }
  };

  return (
    <div className="group bg-[#0a0a0a] border border-[#333] hover:border-[#ccff00] transition-all duration-300 p-6 flex flex-col h-full relative overflow-hidden">
      
      {/* STATUS BADGE */}
      <div className="flex justify-between items-start mb-6">
        <div className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border ${isActive ? 'border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10' : 'border-gray-600 text-gray-500 bg-gray-900'}`}>
           {isActive ? '● LIVE BROADCAST' : '○ ARCHIVED'}
        </div>
        <div className="font-mono text-gray-500 text-xs">ID: {poll.roomCode}</div>
      </div>

      {/* QUESTION */}
      <h3 className="text-xl font-bold text-white mb-6 leading-tight">{poll.question}</h3>

      {/* VOTES VISUALIZATION */}
      <div className="flex-1 space-y-4 mb-8">
        {poll.options.map((opt, i) => {
            const votes = poll.votes ? poll.votes[i] : 0;
            const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
            
            return (
                <div key={i} className="relative">
                    <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                        <span>{opt}</span>
                        <span>{percentage}% ({votes})</span>
                    </div>
                    <div className="h-2 w-full bg-[#222] overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${isActive ? 'bg-[#ccff00]' : 'bg-gray-600'}`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            )
        })}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-4 border-t border-[#222] flex justify-between items-center mt-auto">
         <div className="text-gray-500 text-xs font-mono flex items-center gap-2">
            <FaVoteYea /> {totalVotes} TOTAL VOTES
         </div>
         
         <div className="flex gap-2">
            {isActive && (
                <button onClick={closePoll} className="p-2 text-gray-400 hover:text-white hover:bg-red-900/50 rounded transition" title="Close Poll">
                    <FaStopCircle />
                </button>
            )}
            <button onClick={deletePoll} className="p-2 text-gray-600 hover:text-red-500 transition" title="Delete">
                <FaTrash />
            </button>
         </div>
      </div>
    </div>
  );
};

export default PollCard;