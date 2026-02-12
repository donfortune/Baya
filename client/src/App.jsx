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
// import StudentJoin from './pages/StudentJoin';
// import StudentLive from './pages/StudentLive';
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
//             <Route path="/join" element={<StudentJoin />} />
//             <Route path="/room/:roomCode" element={<StudentLive />} />
//           </Routes>
          
//           {/* 👇 MINIMALIST ERROR-ONLY STYLE CONTAINER */}
//           <ToastContainer 
//             position="bottom-right" // Moved to bottom-right to be less intrusive
//             autoClose={3000}
//             hideProgressBar={true} 
//             newestOnTop={true}
//             closeOnClick
//             rtl={false}
//             pauseOnFocusLoss={false}
//             draggable
//             pauseOnHover={false}
//             theme="dark"
//             toastStyle={{
//               backgroundColor: 'black',
//               border: '1px solid #cc0000', // Red border (since we mostly use this for errors now)
//               color: '#cc0000',            // Red text
//               fontFamily: 'monospace',     
//               fontSize: '12px',
//               boxShadow: 'none',
//               borderRadius: '0px',
//               minHeight: '40px'
//             }}
//           />
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
import { GoogleOAuthProvider } from '@react-oauth/google'; // 👈 Import this

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// New Student Pages
import StudentJoin from './pages/StudentJoin';
import StudentLive from './pages/StudentLive';
import LandingPage from './pages/LandingPage';

// 👈 Access the Client ID from Vite environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    // 👈 Wrap everything with GoogleOAuthProvider
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <SocketProvider>
          <div className="min-h-screen text-white">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              {/* Student Routes */}
              <Route path="/join" element={<StudentJoin />} />
              <Route path="/room/:roomCode" element={<StudentLive />} />
            </Routes>
            
            <ToastContainer 
              position="bottom-right"
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
                border: '1px solid #cc0000',
                color: '#cc0000',
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
    </GoogleOAuthProvider>
  );
}

export default App;