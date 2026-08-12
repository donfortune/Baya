const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const cors = require('cors');
require('dotenv').config();


// =========================
// 1. APP (ALWAYS CREATED)
// =========================
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use('/api', require('./Routes/pollRoutes'));
app.use('/api', require('./Routes/roomRoutes'));
app.use('/api', require('./Routes/userRoutes'));
app.use('/metrics', require('./Routes/metricsRoutes'));

// =========================
// 2. EXPORT APP FOR TESTS
// =========================
module.exports = app;
const pubClient = new Redis(); // Connects to your local background Redis
const subClient = pubClient.duplicate();

// 2. Plug the Redis Adapter into Socket.io
// io.adapter(createAdapter(pubClient, subClient));

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


// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const { createAdapter } = require('@socket.io/redis-adapter');
// const Redis = require('ioredis');
// const mongoose = require('mongoose');
// const swaggerUi = require('swagger-ui-express');
// const swaggerSpec = require('./config/swagger');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.use('/api', require('./Routes/pollRoutes'));
// app.use('/api', require('./Routes/roomRoutes'));
// app.use('/api', require('./Routes/userRoutes'));
// app.use('/metrics', require('./Routes/metricsRoutes'));

// module.exports = app;

// if (require.main === module) {
//   const server = http.createServer(app);

//   const io = new socketIO.Server(server, {
//     cors: {
//       origin: '*',
//       methods: ['GET', 'POST'],
//     },
//   });

//   app.set('io', io);

//   const pubClient = new Redis();
//   const subClient = pubClient.duplicate();
//   io.adapter(createAdapter(pubClient, subClient));

//   io.on('connection', (socket) => {
//     socket.on('join_room', (roomCode) => {
//       socket.join(roomCode);
//     });

//     socket.on('panic_button', (roomCode) => {
//       socket.to(roomCode).emit('panic_alert', {
//         message: 'Panic button activated!',
//       });
//     });

//     socket.on('whisper', ({ roomCode, message }) => {
//       socket.to(roomCode).emit('whisper_message', { message });
//     });

//     socket.on('reaction', ({ roomCode, emoji }) => {
//       io.to(roomCode).emit('reaction_received', {
//         emoji,
//         id: Date.now() + Math.random(),
//       });
//     });
//   });

//   const PORT = process.env.PORT || 3000;

//   mongoose
//     .connect(process.env.MONGODB_URI)
//     .then(() => {
//       server.listen(PORT, () => {});
//     })
//     .catch(console.error);
// }