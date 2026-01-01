// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   motion, 
//   useScroll, 
//   useTransform, 
//   useSpring, 
//   useMotionTemplate, 
//   useMotionValue 
// } from 'framer-motion';
// import { FaArrowRight, FaBolt, FaGhost } from 'react-icons/fa';

// // --- UTILS FOR MOUSE SPOTLIGHT ---
// function useMousePosition() {
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);

//   useEffect(() => {
//     const updateMousePosition = (e) => {
//       mouseX.set(e.clientX);
//       mouseY.set(e.clientY);
//     };
//     window.addEventListener("mousemove", updateMousePosition);
//     return () => window.removeEventListener("mousemove", updateMousePosition);
//   }, [mouseX, mouseY]);

//   return { mouseX, mouseY };
// }

// // --- TILT CARD COMPONENT (3D Hover Effect) ---
// const TiltCard = ({ children, className }) => {
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);
//   const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
//   const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

//   function onMouseMove({ currentTarget, clientX, clientY }) {
//     const { left, top, width, height } = currentTarget.getBoundingClientRect();
//     x.set(clientX - left - width / 2);
//     y.set(clientY - top - height / 2);
//   }

//   const rotateX = useTransform(mouseY, [-100, 100], [5, -5]); // Inverted for natural feel
//   const rotateY = useTransform(mouseX, [-100, 100], [-5, 5]);

//   return (
//     <motion.div
//       style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
//       onMouseMove={onMouseMove}
//       onMouseLeave={() => { x.set(0); y.set(0); }}
//       className={className}
//     >
//       <div style={{ transform: "translateZ(50px)" }} className="h-full">
//         {children}
//       </div>
//     </motion.div>
//   );
// };

// // --- MAIN LANDING PAGE COMPONENT ---
// const LandingPage = () => {
//   const navigate = useNavigate();
//   const { scrollYProgress } = useScroll();
//   const { mouseX, mouseY } = useMousePosition();
  
//   // Parallax Text Logic
//   const yHero = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
//   const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

//   return (
//     <div className="min-h-screen bg-[#030303] text-[#e0e0e0] font-sans selection:bg-[#ccff00] selection:text-black overflow-x-hidden">
      
//       {/* 1. NOISE OVERLAY (Texture) */}
//       <div className="fixed inset-0 z-[1] opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      
//       {/* 2. CURSOR SPOTLIGHT (The "Flashlight") */}
//       <motion.div 
//         className="pointer-events-none fixed inset-0 z-[2] opacity-40 group-hover:opacity-100 transition duration-300"
//         style={{
//           background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(204, 255, 0, 0.06), transparent 80%)`,
//         }}
//       />

//       {/* --- NAVBAR --- */}
//       <nav className="fixed top-0 w-full z-50 mix-blend-difference px-6 py-6 flex justify-between items-center">
//         <div className="text-xl font-black tracking-tighter uppercase text-[#ccff00]">Baya.</div>
//         <div className="flex gap-6 items-center">
//             <button onClick={() => navigate('/login')} className="text-sm font-bold uppercase tracking-widest hover:text-[#ccff00] transition">
//                 Log In
//             </button>
//             <button onClick={() => navigate('/register')} className="hidden md:block bg-white text-black px-5 py-2 text-xs font-black uppercase tracking-widest hover:bg-[#ccff00] transition-colors">
//                 Get Started
//             </button>
//         </div>
//       </nav>

//       {/* --- HERO SECTION --- */}
//       <section className="relative h-screen flex flex-col justify-center items-center px-4 z-10">
//         <motion.div style={{ y: yHero, opacity: opacityHero }} className="text-center relative">
//             {/* The Huge Text */}
//             <h1 className="text-[12vw] leading-[0.85] font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 mb-6">
//                 Read<br/>The<br/>Room
//             </h1>
            
//             {/* The Floating Pill */}
//             <motion.div 
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.5 }}
//                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-32 md:-translate-y-20 rotate-6"
//             >
//                 <div className="bg-[#ccff00] text-black px-4 py-1 text-xs font-black uppercase tracking-widest -rotate-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
//                     Public Beta
//                 </div>
//             </motion.div>

//             <p className="max-w-md mx-auto text-gray-400 text-lg md:text-xl font-mono mt-8 mb-12">
//                 // Stop talking to zombies.<br/>
//                 // Real-time intelligence for the classroom.
//             </p>

//             <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
//                 <button 
//                     onClick={() => navigate('/register')}
//                     className="relative group overflow-hidden bg-white text-black px-10 py-4 font-bold uppercase tracking-wider text-sm hover:bg-[#ccff00] transition-colors duration-300"
//                 >
//                     <span className="relative z-10 flex items-center gap-2">Start Session <FaBolt/></span>
//                 </button>
//                 <button 
//                      onClick={() => navigate('/join')}
//                     className="px-10 py-4 border border-white/20 text-white font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-all duration-300"
//                 >
//                     Join Room
//                 </button>
//             </div>
//         </motion.div>
//       </section>

//       {/* --- SCROLLING MARQUEE (Seamless Loop) --- */}
//       <div className="w-full bg-[#ccff00] overflow-hidden py-4 transform -rotate-1 z-20 relative border-y-4 border-black box-border">
//         <div className="flex gap-8 animate-marquee whitespace-nowrap text-black font-black uppercase text-4xl tracking-tighter">
//             <span>NO SIGNUPS REQUIRED</span> <span className="text-white">★</span> <span>REAL TIME DATA</span> <span className="text-white">★</span> <span>INSTANT FEEDBACK</span> <span className="text-white">★</span> <span>PANIC ALERTS</span> <span className="text-white">★</span> <span>LIVE WHISPERS</span> <span className="text-white">★</span>
//             <span>NO SIGNUPS REQUIRED</span> <span className="text-white">★</span> <span>REAL TIME DATA</span> <span className="text-white">★</span> <span>INSTANT FEEDBACK</span> <span className="text-white">★</span> <span>PANIC ALERTS</span> <span className="text-white">★</span> <span>LIVE WHISPERS</span> <span className="text-white">★</span>
//         </div>
//       </div>

//       {/* --- THE INTEL GRID (INTERACTIVE) --- */}
//       <section className="py-32 px-4 max-w-7xl mx-auto z-10 relative">
//         <div className="mb-16 flex items-end gap-4">
//             <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] text-white mix-blend-difference">
//                 THE<br/>INTEL<span className="text-[#ccff00]">.</span>
//             </h2>
//             <div className="hidden md:block h-4 w-full bg-[#333] mb-4 relative overflow-hidden">
//                 <div className="absolute inset-0 bg-[#ccff00] w-1/3 animate-marquee"></div>
//             </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[700px]">
            
//             {/* CARD 1: PANIC (Brutalist Red) */}
//             <TiltCard className="md:col-span-2 row-span-2 bg-[#111] border border-[#333] hover:border-red-600 transition-colors duration-500 p-8 md:p-12 relative group overflow-hidden">
//                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
//                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                
//                 <div className="relative z-10 flex flex-col justify-between h-full">
//                     <div className="flex justify-between items-start">
//                         <FaGhost className="text-6xl text-[#333] group-hover:text-red-500 transition-colors duration-300" />
//                         <div className="bg-red-900/20 text-red-500 px-3 py-1 font-mono text-xs border border-red-500/50 uppercase">
//                             Warning System
//                         </div>
//                     </div>
                    
//                     <div className="mt-12">
//                         <h3 className="text-5xl md:text-7xl font-black uppercase text-white mb-4 leading-none group-hover:translate-x-2 transition-transform duration-300">
//                             Don't Lose<br/>The Room.
//                         </h3>
//                         <p className="text-gray-400 text-lg max-w-md font-mono border-l-2 border-red-500 pl-4 mt-6">
//                             // 40% of students are confused.<br/>
//                             // They hit panic.<br/>
//                             // You see the spike.<br/>
//                             // You save the lecture.
//                         </p>
//                     </div>

//                     {/* Fake Graph Animation */}
//                     <div className="absolute bottom-0 right-0 w-64 h-32 opacity-20 group-hover:opacity-50 transition duration-500">
//                         <div className="flex items-end h-full gap-1">
//                             {[40, 60, 30, 80, 20, 90, 50, 100].map((h, i) => (
//                                 <div key={i} className="w-full bg-red-600 transition-all duration-300 group-hover:bg-[#ccff00]" style={{ height: `${h}%` }}></div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </TiltCard>

//             {/* CARD 2: WHISPER (Cyber Blue) */}
//             <TiltCard className="bg-[#111] border border-[#333] hover:border-cyan-400 transition-colors duration-500 p-8 relative group overflow-hidden">
//                 <div className="absolute -right-8 -top-8 text-9xl text-[#222] font-black group-hover:text-cyan-900/20 transition duration-500">?</div>
//                 <div className="relative z-10 h-full flex flex-col justify-end">
//                     <div className="w-12 h-1 bg-cyan-400 mb-4 group-hover:w-full transition-all duration-500"></div>
//                     <h3 className="text-3xl font-bold text-white mb-2 uppercase">Whisper<br/>Channel</h3>
//                     <p className="text-gray-400 text-xs font-mono">
//                         {'>'} CONNECTING... <br/>
//                         {'>'} ANONYMOUS MODE: ON <br/>
//                         {'>'} VOICING THE VOICELESS
//                     </p>
//                 </div>
//             </TiltCard>

//             {/* CARD 3: VIBE (Acid Lime) */}
//             <TiltCard className="bg-[#ccff00] text-black p-8 relative group overflow-hidden flex flex-col items-center justify-center text-center">
//                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>
//                 <h3 className="text-5xl font-black uppercase tracking-tighter relative z-10 group-hover:scale-110 transition-transform duration-300">
//                     Vibe<br/>Check
//                 </h3>
//                 <div className="flex gap-4 text-4xl mt-6 relative z-10">
//                     <span className="hover:-translate-y-2 transition duration-300 cursor-help">🔥</span>
//                     <span className="hover:-translate-y-2 transition duration-300 cursor-help">😂</span>
//                     <span className="hover:-translate-y-2 transition duration-300 cursor-help">💩</span>
//                 </div>
//             </TiltCard>

//         </div>
//       </section>

//       {/* --- BLUEPRINT SECTION (Deconstructed) --- */}
//       <section className="py-40 bg-white text-black px-4 relative overflow-hidden">
//         {/* Background Grid Lines */}
//         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
//         <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
//             <div>
//                 <div className="bg-black text-white inline-block px-4 py-1 font-mono text-xs font-bold uppercase mb-6 transform -rotate-2">
//                     System Architecture
//                 </div>
//                 <h2 className="text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85]">
//                     ZERO<br/>FRICTION<br/>ENTRY.
//                 </h2>
//                 <p className="text-2xl font-bold text-gray-400 mb-12 max-w-md">
//                     We killed the signup form. <br/>
//                     <span className="text-black">No emails. No passwords. Just code.</span>
//                 </p>

//                 {/* Steps */}
//                 <div className="space-y-6">
//                     {['Generate Room Code', 'Share with Students', 'Instant Connection'].map((step, i) => (
//                         <div key={i} className="flex items-center gap-6 group cursor-default">
//                             <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-black text-xl group-hover:bg-[#ccff00] group-hover:border-transparent transition-colors">
//                                 {i + 1}
//                             </div>
//                             <div className="text-xl font-bold uppercase tracking-tight group-hover:translate-x-2 transition-transform">
//                                 {step}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* The Raw Wireframe Phone */}
//             <div className="relative">
//                 <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 rounded-[3rem]"></div>
//                 <div className="relative bg-[#f0f0f0] border-4 border-black rounded-[3rem] p-6 h-[600px] flex flex-col shadow-2xl">
//                     <div className="w-full h-8 bg-black/10 rounded-full mb-8"></div>
//                     <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-xl p-8 text-center bg-white">
//                         <div className="text-6xl mb-4 animate-bounce">🚀</div>
//                         <h4 className="text-2xl font-black uppercase mb-2">Baya.Join</h4>
//                         <div className="bg-black text-[#ccff00] font-mono p-4 w-full text-xl mb-4">
//                             X9-F2-A1
//                         </div>
//                         <button className="w-full bg-[#ccff00] py-4 font-black border-2 border-black hover:bg-black hover:text-white transition-colors uppercase">
//                             Enter Room
//                         </button>
//                     </div>
//                 </div>
                
//                 {/* Floating Elements */}
//                 <div className="absolute -left-10 top-1/2 bg-black text-white p-4 font-mono text-xs shadow-[8px_8px_0px_#ccff00]">
//                     STATUS: CONNECTED<br/>
//                     LATENCY: 24ms
//                 </div>
//             </div>
//         </div>
//       </section>

//       {/* --- THE VORTEX FOOTER --- */}
//       <section className="h-[80vh] bg-[#050505] relative flex flex-col items-center justify-center overflow-hidden">
//         {/* Animated Radial */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.15)_0%,transparent_70%)] blur-3xl animate-pulse"></div>
        
//         <div className="relative z-10 text-center px-4">
//             <h2 className="text-[15vw] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-[#333] to-[#111] select-none">
//                 BAYA
//             </h2>
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
//                 <p className="text-white text-xl md:text-3xl font-bold mb-8 uppercase tracking-widest">
//                     The Class is Waiting
//                 </p>
//                 <button 
//                     onClick={() => navigate('/register')}
//                     className="group relative px-16 py-6 bg-transparent border-2 border-[#ccff00] text-[#ccff00] text-2xl font-black uppercase tracking-widest overflow-hidden hover:text-black transition-colors duration-300"
//                 >
//                     <span className="relative z-10">Launch Room</span>
//                     <div className="absolute inset-0 bg-[#ccff00] transform -translate-x-full skew-x-12 group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
//                 </button>
//             </div>
//         </div>

//         <div className="absolute bottom-8 text-[#444] font-mono text-xs">
//             System Status: <span className="text-green-500">OPERATIONAL</span>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default LandingPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionTemplate, 
  useMotionValue,
  useAnimation
} from 'framer-motion';
import { FaBolt, FaGhost, FaTerminal, FaArrowRight, FaCrosshairs } from 'react-icons/fa';

// --- UTILS ---
function useMousePosition() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const updateMousePosition = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY };
}

// --- COMPONENT: TACTICAL RADAR (Panic Card) ---
const TacticalRadar = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            {/* Concentric Circles */}
            <div className="absolute w-[400px] h-[400px] border border-red-900/30 rounded-full"></div>
            <div className="absolute w-[300px] h-[300px] border border-red-900/50 rounded-full"></div>
            <div className="absolute w-[200px] h-[200px] border border-red-500/20 rounded-full"></div>
            <div className="absolute w-[2px] h-[400px] bg-red-900/20"></div>
            <div className="absolute w-[400px] h-[2px] bg-red-900/20"></div>

            {/* The Scanning Line */}
            <motion.div 
                className="absolute w-[200px] h-[200px] origin-bottom-right bg-gradient-to-tl from-red-500/20 to-transparent"
                style={{ top: '50%', left: '50%', transformOrigin: '0% 0%' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            {/* The Target Blip */}
            <motion.div 
                className="absolute w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_red]"
                style={{ top: '30%', right: '30%' }}
                animate={{ opacity: [0, 1, 0, 0] }}
                transition={{ duration: 4, repeat: Infinity, times: [0.3, 0.4, 0.8, 1] }}
            />

            {/* The Lock-On Reticle */}
            <motion.div 
                className="absolute w-12 h-12 border-2 border-red-500 flex items-center justify-center text-[10px] text-red-500 font-mono"
                style={{ top: '28%', right: '28%' }}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, times: [0.3, 0.35, 0.8] }}
            >
                <FaCrosshairs />
            </motion.div>
        </div>
    )
}

// --- COMPONENT: TERMINAL FEED (Whisper) ---
const TerminalFeed = () => {
    const [lines, setLines] = useState([
        "> connecting...",
        "> anonymous_mode: on",
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newLogs = [
                "> s_24: Is this on the test?",
                "> s_01: Repeat slide 4?",
                "> sys: whisper received",
                "> s_12: Too fast!",
                "> packet_loss: 0%",
            ];
            const randomLog = newLogs[Math.floor(Math.random() * newLogs.length)];
            setLines(prev => [...prev.slice(-5), randomLog]); 
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="font-mono text-[10px] md:text-xs text-cyan-400 opacity-70 mt-4 h-32 overflow-hidden flex flex-col justify-end">
            {lines.map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    {line}
                </motion.div>
            ))}
        </div>
    );
}

// --- COMPONENT: INTERACTIVE HYPE BUTTON (Vibe Check) ---
const InteractiveHype = () => {
    const controls = useAnimation();
    const [clicks, setClicks] = useState(0);

    const handleClick = () => {
        setClicks(c => c + 1);
        controls.start({
            scale: [1, 0.9, 1.1, 1],
            transition: { duration: 0.2 }
        });
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            {/* Flying Emojis on Click */}
            {Array.from({ length: clicks }).map((_, i) => (
                <EmojiParticle key={i} />
            ))}

            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClick}
                className="w-32 h-32 rounded-full bg-black border-4 border-black flex items-center justify-center shadow-2xl relative group overflow-hidden"
            >
                <div className="absolute inset-0 bg-[#ccff00] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10 font-black text-2xl uppercase group-hover:text-black text-[#ccff00] transition-colors">
                    PUSH
                </span>
            </motion.button>
            <div className="mt-4 font-mono text-xs uppercase tracking-widest text-black/50 font-bold">Try Me</div>
        </div>
    )
}

const EmojiParticle = () => {
    const emojis = ['🔥', '😂', '👏', '❤️'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const randomX = Math.random() * 200 - 100;
    
    return (
        <motion.div
            className="absolute text-4xl pointer-events-none"
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -300, x: randomX, opacity: 0, scale: 1.5, rotate: randomX }}
            transition={{ duration: 1, ease: "easeOut" }}
        >
            {randomEmoji}
        </motion.div>
    )
}

// --- COMPONENT: TILT CARD ---
const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  const rotateX = useTransform(mouseY, [-100, 100], [5, -5]);
  const rotateY = useTransform(mouseX, [-100, 100], [-5, 5]);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      <div style={{ transform: "translateZ(50px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE ---
const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const { mouseX, mouseY } = useMousePosition();
  
  const yHero = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-[#030303] text-[#e0e0e0] font-sans selection:bg-[#ccff00] selection:text-black overflow-x-hidden">
      
      {/* GLOBAL BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-[1] opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      <motion.div 
        className="pointer-events-none fixed inset-0 z-[2] opacity-40 group-hover:opacity-100 transition duration-300"
        style={{ background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(204, 255, 0, 0.06), transparent 80%)` }}
      />

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 mix-blend-difference px-6 py-6 flex justify-between items-center">
        <div className="text-xl font-black tracking-tighter uppercase text-[#ccff00]">Baya.</div>
        <div className="flex gap-6 items-center">
            <button onClick={() => navigate('/login')} className="text-sm font-bold uppercase tracking-widest hover:text-[#ccff00] transition">Log In</button>
            <button onClick={() => navigate('/register')} className="hidden md:block bg-white text-black px-5 py-2 text-xs font-black uppercase tracking-widest hover:bg-[#ccff00] transition-colors">Get Started</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen flex flex-col justify-center items-center px-4 z-10">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="text-center relative">
            <h1 className="text-[12vw] leading-[0.85] font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 mb-6">
                Read<br/>The<br/>Room
            </h1>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-32 md:-translate-y-20 rotate-6"
            >
                <div className="bg-[#ccff00] text-black px-4 py-1 text-xs font-black uppercase tracking-widest -rotate-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">Public Beta</div>
            </motion.div>
            <p className="max-w-md mx-auto text-gray-400 text-lg md:text-xl font-mono mt-8 mb-12">// Stop talking to zombies.<br/>// Real-time intelligence for the classroom.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <button onClick={() => navigate('/register')} className="relative group overflow-hidden bg-white text-black px-10 py-4 font-bold uppercase tracking-wider text-sm hover:bg-[#ccff00] transition-colors duration-300">
                    <span className="relative z-10 flex items-center gap-2">Start Session <FaBolt/></span>
                </button>
                <button onClick={() => navigate('/join')} className="px-10 py-4 border border-white/20 text-white font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-all duration-300">Join Room</button>
            </div>
        </motion.div>
      </section>

      {/* MARQUEE */}
      <div className="w-full bg-[#ccff00] overflow-hidden py-4 transform -rotate-1 z-20 relative border-y-4 border-black box-border">
        <div className="flex gap-8 animate-marquee whitespace-nowrap text-black font-black uppercase text-4xl tracking-tighter">
            <span>NO SIGNUPS REQUIRED</span> <span className="text-white">★</span> <span>REAL TIME DATA</span> <span className="text-white">★</span> <span>INSTANT FEEDBACK</span> <span className="text-white">★</span> <span>PANIC ALERTS</span> <span className="text-white">★</span> <span>LIVE WHISPERS</span> <span className="text-white">★</span>
            <span>NO SIGNUPS REQUIRED</span> <span className="text-white">★</span> <span>REAL TIME DATA</span> <span className="text-white">★</span> <span>INSTANT FEEDBACK</span> <span className="text-white">★</span> <span>PANIC ALERTS</span> <span className="text-white">★</span> <span>LIVE WHISPERS</span> <span className="text-white">★</span>
        </div>
      </div>

      {/* --- THE INTEL GRID --- */}
      <section className="py-32 px-4 max-w-7xl mx-auto z-10 relative">
        <div className="mb-16 flex items-end gap-4">
            <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] text-white mix-blend-difference">
                THE<br/>INTEL<span className="text-[#ccff00]">.</span>
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[700px]">
            
            {/* CARD 1: PANIC (TACTICAL RADAR) */}
            <TiltCard className="md:col-span-2 row-span-2 bg-[#0a0a0a] border border-[#333] hover:border-red-600 transition-colors duration-500 relative group overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
                
                {/* THE RADAR HUD */}
                <TacticalRadar />
                
                <div className="relative z-10 p-8 md:p-12 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                        <FaGhost className="text-6xl text-[#333] group-hover:text-red-500 transition-colors duration-300" />
                        <div className="flex flex-col items-end">
                            <div className="bg-red-900/20 text-red-500 px-3 py-1 font-mono text-xs border border-red-500/50 uppercase flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                ANOMALY DETECTED
                            </div>
                            <div className="font-mono text-4xl font-bold text-red-600 tracking-tighter tabular-nums">SECTOR 4</div>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <h3 className="text-5xl md:text-7xl font-black uppercase text-white mb-4 leading-none group-hover:translate-x-2 transition-transform duration-300">
                            Don't Lose<br/>The Room.
                        </h3>
                        <div className="text-gray-400 text-lg font-mono border-l-2 border-red-500 pl-4 mt-6">
                            // RADAR SWEEP COMPLETE.<br/>
                            // CONFUSION SPIKE DETECTED.<br/>
                            // TARGET ACQUIRED.<br/>
                        </div>
                    </div>
                </div>
            </TiltCard>

            {/* CARD 2: WHISPER (TERMINAL) */}
            <TiltCard className="bg-[#0a0a0a] border border-[#333] hover:border-cyan-400 transition-colors duration-500 p-8 relative group overflow-hidden flex flex-col">
                <div className="absolute top-4 right-4 text-cyan-900/40 text-4xl"><FaTerminal /></div>
                <div className="relative z-10 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="text-3xl font-bold text-white mb-2 uppercase">Whisper<br/>Channel</h3>
                        <div className="w-12 h-1 bg-cyan-400 mb-4 group-hover:w-full transition-all duration-500"></div>
                    </div>
                    <div className="border-t border-cyan-900/50 pt-4 relative">
                        <div className="absolute -top-3 left-0 bg-[#0a0a0a] px-2 text-[10px] text-cyan-600 uppercase font-bold">Incoming Stream</div>
                        <TerminalFeed />
                    </div>
                </div>
            </TiltCard>

            {/* CARD 3: VIBE CHECK (INTERACTIVE TRIGGER) */}
            <TiltCard className="bg-[#ccff00] text-black p-8 relative group overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>
                
                {/* INTERACTIVE BUTTON */}
                <InteractiveHype />
                
                <div className="absolute bottom-6 left-0 w-full text-center">
                    <h3 className="text-2xl font-black uppercase tracking-tighter group-hover:opacity-0 transition-opacity">
                        Vibe Check
                    </h3>
                </div>
            </TiltCard>

        </div>
      </section>

      {/* --- BLUEPRINT SECTION --- */}
      <section className="py-40 bg-white text-black px-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
                <div className="bg-black text-white inline-block px-4 py-1 font-mono text-xs font-bold uppercase mb-6 transform -rotate-2">System Architecture</div>
                <h2 className="text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85]">ZERO<br/>FRICTION<br/>ENTRY.</h2>
                <p className="text-2xl font-bold text-gray-400 mb-12 max-w-md">We killed the signup form. <br/><span className="text-black">No emails. No passwords. Just code.</span></p>
                <div className="space-y-6">
                    {['Generate Room Code', 'Share with Students', 'Instant Connection'].map((step, i) => (
                        <div key={i} className="flex items-center gap-6 group cursor-default">
                            <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-black text-xl group-hover:bg-[#ccff00] group-hover:border-transparent transition-colors">{i + 1}</div>
                            <div className="text-xl font-bold uppercase tracking-tight group-hover:translate-x-2 transition-transform">{step}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative">
                <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 rounded-[3rem]"></div>
                <div className="relative bg-[#f0f0f0] border-4 border-black rounded-[3rem] p-6 h-[600px] flex flex-col shadow-2xl">
                    <div className="w-full h-8 bg-black/10 rounded-full mb-8"></div>
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-xl p-8 text-center bg-white">
                        <div className="text-6xl mb-4 animate-bounce">🚀</div>
                        <h4 className="text-2xl font-black uppercase mb-2">Baya.Join</h4>
                        <div className="bg-black text-[#ccff00] font-mono p-4 w-full text-xl mb-4">X9-F2-A1</div>
                        <button className="w-full bg-[#ccff00] py-4 font-black border-2 border-black hover:bg-black hover:text-white transition-colors uppercase">Enter Room</button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- HYPERSPACE FOOTER --- */}
      <section className="h-[80vh] bg-[#050505] relative flex flex-col items-center justify-center overflow-hidden perspective-1000">
        <div className="absolute inset-0 opacity-20" 
             style={{ 
                background: 'linear-gradient(transparent 50%, #ccff00 50%), linear-gradient(90deg, transparent 50%, #ccff00 50%)',
                backgroundSize: '100px 100px',
                transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(3)',
             }}>
             <motion.div className="absolute inset-0" animate={{ backgroundPosition: ['0px 0px', '0px 100px'] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ccff00] blur-[150px] opacity-20 rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-center px-4">
            <h2 className="text-[15vw] leading-none font-black text-white mix-blend-overlay select-none opacity-50">BAYA</h2>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center">
                <p className="text-white text-2xl md:text-3xl font-bold mb-8 uppercase tracking-[0.5em]">The Class is Waiting</p>
                <button onClick={() => navigate('/register')} className="group relative px-12 py-5 bg-[#ccff00] text-black text-xl font-black uppercase tracking-widest hover:scale-110 transition-transform duration-300 shadow-[0_0_50px_rgba(204,255,0,0.5)]">
                    <span className="relative z-10 flex items-center gap-3">Launch Room <FaArrowRight/></span>
                </button>
            </div>
        </div>
        <div className="absolute bottom-8 text-[#666] font-mono text-xs tracking-widest">SYSTEM_STATUS: <span className="text-[#ccff00] animate-pulse">ONLINE</span></div>
      </section>
    </div>
  );
};

export default LandingPage;