// const express = require('express');
// const env = require('dotenv')
// const mongoose = require('mongoose');
// const mongoSanitize = require('express-mongo-sanitize');
// const pollRoutes = require('./Routes/pollRoutes');
// const roomRoutes = require('./Routes/roomRoutes')
// const userRoutes = require('./Routes/userRoutes');
// const metricRoutes = require('./Routes/metricsRoutes');
// const metricsMiddleware = require('./Middlewares/metricsMiddlewares');
// const cors = require('cors');
// const socket = require('socket.io');


// const app = express();
// const server = require('http').createServer(app);

// const io = new socket.Server(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }   
// });

// app.set('io', io); // Make io accessible in routes/controllers 

// io.on('connection', (socket) => {
//     console.log('⚡ New client connected:', socket.id);

//     // Add this to handle room joining
//     socket.on('join_room', (roomCode) => {
//         socket.join(roomCode);
//         console.log(`Socket ${socket.id} joined ${roomCode}`);
//     });

//     // Add Panic Button Event
//     socket.on('panic_button', (roomCode) => {
//         console.log(`Panic button pressed in room: ${roomCode}`);
//         // Broadcast to all clients in the room except the sender
//         socket.to(roomCode).emit('panic_alert', { message: 'Panic button activated!' });
//     });

//     //Add whsipers event
//     socket.on('whisper', ({ roomCode, message }) => {
//         console.log(`Whisper in room ${roomCode}: ${message}`);
//         // Broadcast the whisper to all clients in the room except the sender
//         socket.to(roomCode).emit('whisper_message', { message });
//     });

//     // // Add emoji reaction event
//     // socket.on('emoji_reaction', ({ roomCode, emoji }) => {
//     //     console.log(`Emoji reaction in room ${roomCode}: ${emoji}`);
//     //     // Broadcast the emoji reaction to all clients in the room except the sender
//     //     socket.to(roomCode).emit('emoji_reaction_broadcast', { emoji });
//     // });

//     // =======================================================
//     // 4. MISSING PIECE: EMOJI REACTIONS 🚀
//     // =======================================================
//     socket.on('reaction', ({ roomCode, emoji }) => {
//         console.log(`Reaction in ${roomCode}: ${emoji}`);
//         // "Loudspeaker": Send to everyone in the room (Teacher AND Student)
//         io.to(roomCode).emit('reaction_received', { 
//             emoji, 
//             id: Date.now() + Math.random() // Unique ID for animation
//         });
//     });
//     // =======================================================

//     socket.on('disconnect', () => {
//         console.log('Client disconnected:', socket.id);
//     });
// });




// env.config();


// app.use(cors());




// // mongoose.connect(process.env.MONGODB_URI, {
// //     // useNewUrlParser: true,
// //     // useUnifiedTopology: true,
// // }).then(() => {
// //     console.log('Connected to MongoDB');
// // }).catch((err) => {
// //     console.error('Error connecting to MongoDB:', err);
// // })


// app.use(express.json());
// // app.use(mongoSanitize());

// app.use(metricsMiddleware.requestMetricsMiddleware);

// app.use('/api', pollRoutes);
// app.use('/api', roomRoutes);
// app.use('/api', userRoutes);
// app.use('/metrics', metricRoutes);



// // server.listen(port, () => {
// //     console.log(`Server is running on http://localhost:${port}`);
// // })


// if (require.main === module) {
//     const port = process.env.PORT 
//     mongoose.connect(process.env.MONGODB_URI, {
//         // useNewUrlParser: true,
//         // useUnifiedTopology: true,
//     }).then(() => {
//         console.log('Connected to MongoDB');
//         server.listen(port, () => {
//             console.log(`Server is running on http://localhost:${port}`);
//         });
// }
// ).catch((err) => {    console.error('Error connecting to MongoDB:', err);
// })
// } else {
//     module.exports = app; // Export app for testing
// }

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


// =========================
// 1. APP (ALWAYS CREATED)
// =========================
const app = express();
app.use(cors());
app.use(express.json());



// routes
app.use('/api', require('./Routes/pollRoutes'));
app.use('/api', require('./Routes/roomRoutes'));
app.use('/api', require('./Routes/userRoutes'));
app.use('/metrics', require('./Routes/metricsRoutes'));

// =========================
// 2. EXPORT APP FOR TESTS
// =========================
module.exports = app;

// =========================
// 3. START SERVER ONLY IF RUN DIRECTLY
// =========================
if (require.main === module) {
  const server = http.createServer(app);

  const io = new socketIO.Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('⚡ Client connected:', socket.id);

    socket.on('join_room', (roomCode) => {
      socket.join(roomCode);
    });

    socket.on('panic_button', (roomCode) => {
      socket.to(roomCode).emit('panic_alert', {
        message: 'Panic button activated!',
      });
    });

    socket.on('whisper', ({ roomCode, message }) => {
      socket.to(roomCode).emit('whisper_message', { message });
    });

    socket.on('reaction', ({ roomCode, emoji }) => {
      io.to(roomCode).emit('reaction_received', {
        emoji,
        id: Date.now() + Math.random(),
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(console.error);
}
