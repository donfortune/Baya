import React from 'react';
import { FaExclamationTriangle, FaTimes, FaTrashAlt } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      ></div>

      {/* MODAL */}
      <div className="relative bg-[#0a0a0a] border border-red-900/50 w-full max-w-md rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden animate-scale-up">
        
        {/* HEADER */}
        <div className="bg-red-900/10 border-b border-red-900/30 p-4 flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <h3 className="text-red-500 font-black uppercase tracking-widest text-lg">{title || 'System Warning'}</h3>
        </div>

        {/* BODY */}
        <div className="p-6">
            <p className="text-gray-300 text-sm leading-relaxed font-mono">
                {message}
            </p>
            
            <div className="mt-4 bg-[#111] p-3 border border-[#333] rounded text-xs text-gray-500 font-mono">
                Running: <span className="text-red-500">sudo purge --force</span><br/>
                Status: <span className="text-white">Waiting for authorization...</span>
            </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-[#222] flex gap-3 justify-end bg-[#050505]">
            <button 
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-400 hover:text-white font-mono text-xs uppercase tracking-widest transition disabled:opacity-50"
            >
                Cancel
            </button>
            
            <button 
                onClick={onConfirm}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Processing...' : <><FaTrashAlt /> Confirm Purge</>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;