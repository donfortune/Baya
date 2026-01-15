// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { FaTrash, FaStopCircle, FaVoteYea } from 'react-icons/fa';

// // 👇 IMPORT THE SHARED MODAL
// import ConfirmationModal from './ConfirmationModal';

// const PollCard = ({ poll, onUpdate, onClick }) => {
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const totalVotes = poll.votes ? poll.votes.reduce((a, b) => a + b, 0) : 0;
//   const isActive = poll.status === 'active';

//   // --- ACTIONS ---
//   const closePoll = async (e) => {
//     e.stopPropagation(); // Prevent opening details modal
//     try {
//       const res = await axios.patch(
//         `http://localhost:3000/api/polls/${poll._id}/status`, 
//         { status: 'closed' }, 
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       toast.info("POLL CLOSED");
//       if (onUpdate) {
//         const updatedPoll = res.data && res.data._id ? res.data : { ...poll, status: 'closed' };
//         onUpdate(updatedPoll, false);
//       }
//     } catch (e) { console.error(e); toast.error("Error closing poll"); }
//   };

//   // 1. TRIGGER MODAL (Instead of window.confirm)
//   const handleDeleteClick = (e) => {
//     e.stopPropagation(); // Prevent opening details modal
//     setIsDeleteModalOpen(true);
//   };

//   // 2. ACTUAL DELETE LOGIC (Passed to Modal)
//   const confirmDelete = async () => {
//     setIsDeleting(true);
//     try {
//       await axios.delete(`http://localhost:3000/api/polls/${poll._id}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       toast.success("POLL DELETED");
      
//       if (onUpdate) {
//         onUpdate(poll._id, true);
//       }
//       setIsDeleteModalOpen(false); // Close modal
//     } catch (e) { 
//         console.error(e); 
//         toast.error("Error deleting poll");
//         setIsDeleting(false); 
//     }
//   };

//   return (
//     <>
//         <div 
//             onClick={onClick}
//             className={`group cursor-pointer bg-[#0a0a0a] border transition-all duration-300 p-6 flex flex-col h-full relative overflow-hidden ${isActive ? 'border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'border-[#333] hover:border-gray-500'}`}
//         >
        
//         {/* STATUS BADGE */}
//         <div className="flex justify-between items-start mb-6">
//             <div className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border ${isActive ? 'border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10 animate-pulse' : 'border-gray-600 text-gray-500 bg-gray-900'}`}>
//             {isActive ? '● LIVE BROADCAST' : '○ ARCHIVED'}
//             </div>
//             <div className="font-mono text-gray-500 text-xs">ID: {poll.roomCode}</div>
//         </div>

//         {/* QUESTION */}
//         <h3 className={`text-xl font-bold mb-6 leading-tight ${isActive ? 'text-white' : 'text-gray-400'}`}>{poll.question}</h3>

//         {/* VOTES VISUALIZATION */}
//         <div className="flex-1 space-y-4 mb-8">
//             {poll.options.map((opt, i) => {
//                 const votes = poll.votes ? poll.votes[i] : 0;
//                 const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
                
//                 return (
//                     <div key={i} className="relative">
//                         <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
//                             <span>{opt}</span>
//                             <span>{percentage}% ({votes})</span>
//                         </div>
//                         <div className="h-2 w-full bg-[#222] overflow-hidden rounded-full">
//                             <div 
//                                 className={`h-full transition-all duration-500 ${isActive ? 'bg-[#ccff00]' : 'bg-gray-600'}`} 
//                                 style={{ width: `${percentage}%` }}
//                             ></div>
//                         </div>
//                     </div>
//                 )
//             })}
//         </div>

//         {/* FOOTER ACTIONS */}
//         <div className="pt-4 border-t border-[#222] flex justify-between items-center mt-auto" onClick={(e) => e.stopPropagation()}>
//             <div className="text-gray-500 text-xs font-mono flex items-center gap-2">
//                 <FaVoteYea /> {totalVotes} TOTAL VOTES
//             </div>
            
//             <div className="flex gap-2">
//                 {isActive && (
//                     <button onClick={closePoll} className="p-2 text-[#ccff00] hover:bg-[#ccff00] hover:text-black border border-[#ccff00]/30 rounded transition flex items-center gap-2 text-xs font-bold uppercase" title="Stop Broadcast">
//                         <FaStopCircle /> Stop
//                     </button>
//                 )}
//                 <button onClick={handleDeleteClick} className="p-2 text-gray-600 hover:text-red-500 transition" title="Delete">
//                     <FaTrash />
//                 </button>
//             </div>
//         </div>
//         </div>

//         {/* 👇 3. RENDER THE CONFIRMATION MODAL */}
//         <ConfirmationModal
//             isOpen={isDeleteModalOpen}
//             onClose={() => setIsDeleteModalOpen(false)}
//             onConfirm={confirmDelete}
//             isLoading={isDeleting}
//             title="Delete Poll"
//             message={`Are you sure you want to delete the poll "${poll.question}"? This action cannot be undone.`}
//         />
//     </>
//   );
// };

// export default PollCard;
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Keep for ERRORS only
import { FaTrash, FaStopCircle, FaVoteYea } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal';

const PollCard = ({ poll, onUpdate, onClick }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const totalVotes = poll.votes ? poll.votes.reduce((a, b) => a + b, 0) : 0;
  const isActive = poll.status === 'active';

  // --- ACTIONS ---
  const closePoll = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.patch(
        `http://localhost:3000/api/polls/${poll._id}/status`, 
        { status: 'closed' }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // ❌ REMOVED: toast.info("POLL CLOSED");
      // ✅ Visual confirmation happens instantly below:

      if (onUpdate) {
        const updatedPoll = res.data && res.data._id ? res.data : { ...poll, status: 'closed' };
        onUpdate(updatedPoll, false);
      }
    } catch (e) { 
        console.error(e); 
        toast.error("Network Error: Could not close."); // Keep errors!
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/api/polls/${poll._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // ❌ REMOVED: toast.success("POLL DELETED");
      // ✅ The card vanishing is the confirmation.
      
      if (onUpdate) {
        onUpdate(poll._id, true);
      }
      setIsDeleteModalOpen(false);
    } catch (e) { 
        console.error(e); 
        toast.error("Could not delete poll."); // Keep errors
        setIsDeleting(false); 
    }
  };

  return (
    <>
        <div 
            onClick={onClick}
            className={`group cursor-pointer bg-[#0a0a0a] border transition-all duration-300 p-6 flex flex-col h-full relative overflow-hidden ${isActive ? 'border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'border-[#333] hover:border-gray-500'}`}
        >
          {/* ... (Rest of UI remains exactly the same) ... */}
          
          <div className="flex justify-between items-start mb-6">
            <div className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border ${isActive ? 'border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10 animate-pulse' : 'border-gray-600 text-gray-500 bg-gray-900'}`}>
            {isActive ? '● LIVE BROADCAST' : '○ ARCHIVED'}
            </div>
            <div className="font-mono text-gray-500 text-xs">ID: {poll.roomCode}</div>
          </div>

          <h3 className={`text-xl font-bold mb-6 leading-tight ${isActive ? 'text-white' : 'text-gray-400'}`}>{poll.question}</h3>

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
                        <div className="h-2 w-full bg-[#222] overflow-hidden rounded-full">
                            <div 
                                className={`h-full transition-all duration-500 ${isActive ? 'bg-[#ccff00]' : 'bg-gray-600'}`} 
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                )
            })}
        </div>

        <div className="pt-4 border-t border-[#222] flex justify-between items-center mt-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-gray-500 text-xs font-mono flex items-center gap-2">
                <FaVoteYea /> {totalVotes} TOTAL VOTES
            </div>
            
            <div className="flex gap-2">
                {isActive && (
                    <button onClick={closePoll} className="p-2 text-[#ccff00] hover:bg-[#ccff00] hover:text-black border border-[#ccff00]/30 rounded transition flex items-center gap-2 text-xs font-bold uppercase" title="Stop Broadcast">
                        <FaStopCircle /> Stop
                    </button>
                )}
                <button onClick={handleDeleteClick} className="p-2 text-gray-600 hover:text-red-500 transition" title="Delete">
                    <FaTrash />
                </button>
            </div>
        </div>
        </div>

        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            isLoading={isDeleting}
            title="Delete Poll"
            message={`Are you sure you want to delete the poll "${poll.question}"? This action cannot be undone.`}
        />
    </>
  );
};

export default PollCard;
