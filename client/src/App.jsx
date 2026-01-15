// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { SocketProvider } from './context/SocketContext';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import ProtectedRoute from './components/ProtectedRoute';

// // New Student Pages
// import StudentJoin from './pages/StudentJoin'; // 👈 Import
// import StudentLive from './pages/StudentLive'; // 👈 Import
// import LandingPage from './pages/LandingPage';

// function App() {
//   return (
//     <BrowserRouter>
//       <SocketProvider>
//         <div className="min-h-screen text-white">
//           <Routes>
//             <Route path="/" element={<LandingPage />} />
//             {/* <Route path="/" element={<Home />} /> */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
            
//             <Route element={<ProtectedRoute />}>
//               <Route path="/dashboard" element={<Dashboard />} />
//             </Route>

//             {/* Student Routes */}
//             <Route path="/join" element={<StudentJoin />} />        {/* 👈 Route 1 */}
//             <Route path="/room/:roomCode" element={<StudentLive />} /> {/* 👈 Route 2 */}
            
//           </Routes>
          
//           <ToastContainer position="top-center" theme="dark" />
//         </div>
//       </SocketProvider>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// New Student Pages
import StudentJoin from './pages/StudentJoin';
import StudentLive from './pages/StudentLive';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <div className="min-h-screen text-white">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Student Routes */}
            <Route path="/join" element={<StudentJoin />} />
            <Route path="/room/:roomCode" element={<StudentLive />} />
          </Routes>
          
          {/* 👇 MINIMALIST ERROR-ONLY STYLE CONTAINER */}
          <ToastContainer 
            position="bottom-right" // Moved to bottom-right to be less intrusive
            autoClose={3000}
            hideProgressBar={true} 
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover={false}
            theme="dark"
            toastStyle={{
              backgroundColor: 'black',
              border: '1px solid #cc0000', // Red border (since we mostly use this for errors now)
              color: '#cc0000',            // Red text
              fontFamily: 'monospace',     
              fontSize: '12px',
              boxShadow: 'none',
              borderRadius: '0px',
              minHeight: '40px'
            }}
          />
        </div>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;