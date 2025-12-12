import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center animate-slide-up">
      <h1 className="text-7xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
        baya.
      </h1>
      <p className="text-xl text-gray-400 mb-12 font-light">
        Real-time classroom intelligence.
      </p>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full">
        <Link to="/login" className="glass p-8 rounded-2xl hover:bg-white/10 transition-all text-left group">
          <div className="text-6xl mb-4 group-hover:scale-110 transition">📊</div>
          <h2 className="text-2xl font-bold">Host Session</h2>
          <p className="text-sm text-gray-400">Login to manage polls</p>
        </Link>

        <Link to="/join" className="glass p-8 rounded-2xl hover:bg-white/10 transition-all text-left group">
          <div className="text-6xl mb-4 group-hover:scale-110 transition">👋</div>
          <h2 className="text-2xl font-bold">Join Session</h2>
          <p className="text-sm text-gray-400">Enter code to vote</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;