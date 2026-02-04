// import { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { FaTimes, FaPlus, FaSpinner } from 'react-icons/fa';

// const CreatePollModal = ({ isOpen, onClose, onCreated, roomCode }) => {
//   const [question, setQuestion] = useState('');
//   const [options, setOptions] = useState(['', '']);
//   const [loading, setLoading] = useState(false);

//   if (!isOpen) return null;

//   // Handle Option Input Change
//   const handleOptionChange = (index, value) => {
//     const newOptions = [...options];
//     newOptions[index] = value;
//     setOptions(newOptions);
//   };

//   // Add a new option input
//   const addOption = () => setOptions([...options, '']);

//   // Submit Logic
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Filter out empty options
//     const validOptions = options.filter(opt => opt.trim() !== '');
//     if (validOptions.length < 2) return toast.error("Please add at least 2 options.");

//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const payload = { 
//         question, 
//         options: validOptions, 
//         roomCode 
//       };

//       const res = await axios.post('http://localhost:3000/api/polls', payload, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       toast.success("Poll Launched! 🚀");
//       onCreated(res.data); // Update parent state
      
//       // Reset form
//       setQuestion('');
//       setOptions(['', '']);
//       onClose();
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to create poll");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-slide-up">
//       <div className="bg-white text-gray-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
        
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-xl font-bold">New Question</h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-black transition">
//             <FaTimes size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit}>
//           {/* Question Input */}
//           <div className="mb-4">
//             <label className="text-xs font-bold text-gray-500 uppercase">Question</label>
//             <input 
//               required
//               className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500 mt-1"
//               placeholder="e.g. Do you understand?"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//             />
//           </div>

//           {/* Options Inputs */}
//           <div className="mb-6">
//             <label className="text-xs font-bold text-gray-500 uppercase">Options</label>
//             <div className="space-y-2 mt-1 max-h-48 overflow-y-auto">
//               {options.map((opt, index) => (
//                 <input 
//                   key={index}
//                   required
//                   className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500"
//                   placeholder={`Option ${index + 1}`}
//                   value={opt}
//                   onChange={(e) => handleOptionChange(index, e.target.value)}
//                 />
//               ))}
//             </div>
//             <button type="button" onClick={addOption} className="mt-2 text-xs font-bold text-blue-600 uppercase flex items-center gap-1 hover:text-blue-800">
//               <FaPlus /> Add Option
//             </button>
//           </div>

//           <button 
//             type="submit" 
//             disabled={loading}
//             className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2 disabled:opacity-50"
//           >
//             {loading ? <FaSpinner className="animate-spin" /> : 'Launch Poll'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreatePollModal;

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTimes, FaPlus, FaSpinner, FaShieldAlt, FaCheck } from 'react-icons/fa';

const CreatePollModal = ({ isOpen, onClose, onCreated, roomCode }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [isStrict, setIsStrict] = useState(false); // 👈 New Election Mode State

  if (!isOpen) return null;

  // Handle Option Input Change
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Add a new option input
  const addOption = () => setOptions([...options, '']);

  // Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty options
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) return toast.error("Please add at least 2 options.");

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = { 
        question, 
        options: validOptions, 
        // Only send roomCode if it's an existing room (not 'NEW')
        roomCode: roomCode !== 'NEW' ? roomCode : undefined,
        isStrict: isStrict // 👈 Sending the election mode flag
      };

      // ✅ Corrected URL to match your server route
      const res = await axios.post('http://localhost:3000/api/polls', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(isStrict ? "Election Started! 🗳️" : "Poll Launched! 🚀");
      onCreated(res.data); // Update parent state
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setIsStrict(false);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-slide-up">
      <div className="bg-white text-gray-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            New Question
            {isStrict && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">Election Mode</span>}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Question Input */}
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase">Question</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500 mt-1"
              placeholder="e.g. Who should be Faculty President?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          {/* Options Inputs */}
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase">Options</label>
            <div className="space-y-2 mt-1 max-h-48 overflow-y-auto">
              {options.map((opt, index) => (
                <input 
                  key={index}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500"
                  placeholder={`Option ${index + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              ))}
            </div>
            <button type="button" onClick={addOption} className="mt-2 text-xs font-bold text-blue-600 uppercase flex items-center gap-1 hover:text-blue-800">
              <FaPlus /> Add Option
            </button>
          </div>

          {/* 👇 NEW: Election Mode Toggle (Styled for White Theme) */}
          <div 
            className={`mb-6 flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isStrict ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setIsStrict(!isStrict)}
          >
            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                isStrict ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
            }`}>
                {isStrict && <FaCheck size={10} />}
            </div>
            <div>
                <h4 className={`text-sm font-bold flex items-center gap-2 ${isStrict ? 'text-blue-800' : 'text-gray-700'}`}>
                    <FaShieldAlt className={isStrict ? 'text-blue-600' : 'text-gray-400'}/> 
                    Election Mode (Strict)
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-snug">
                    Require students to enter a <strong>Student ID</strong>. Prevents double voting.
                </p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition flex justify-center items-center gap-2 disabled:opacity-50 ${
                isStrict ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-black hover:bg-gray-800 text-white'
            }`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : (isStrict ? 'Launch Election' : 'Launch Poll')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;