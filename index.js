const express = require('express');
const env = require('dotenv')
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const pollRoutes = require('./Routes/pollRoutes');
const roomRoutes = require('./Routes/roomRoutes')
const userRoutes = require('./Routes/userRoutes');
const metricRoutes = require('./Routes/metricsRoutes');
const metricsMiddleware = require('./Middlewares/metricsMiddlewares');
const cors = require('cors');
const socket = require('socket.io');


const app = express();
const server = require('http').createServer(app);

const io = new socket.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }   
});

app.set('io', io); // Make io accessible in routes/controllers 

io.on('connection', (socket) => {
    console.log('⚡ New client connected:', socket.id);

    // Add this to handle room joining
    socket.on('join_room', (roomCode) => {
        socket.join(roomCode);
        console.log(`Socket ${socket.id} joined ${roomCode}`);
    });

    // Add Panic Button Event
    socket.on('panic_button', (roomCode) => {
        console.log(`Panic button pressed in room: ${roomCode}`);
        // Broadcast to all clients in the room except the sender
        socket.to(roomCode).emit('panic_alert', { message: 'Panic button activated!' });
    });

    //Add whsipers event
    socket.on('whisper', ({ roomCode, message }) => {
        console.log(`Whisper in room ${roomCode}: ${message}`);
        // Broadcast the whisper to all clients in the room except the sender
        socket.to(roomCode).emit('whisper_message', { message });
    });

    // // Add emoji reaction event
    // socket.on('emoji_reaction', ({ roomCode, emoji }) => {
    //     console.log(`Emoji reaction in room ${roomCode}: ${emoji}`);
    //     // Broadcast the emoji reaction to all clients in the room except the sender
    //     socket.to(roomCode).emit('emoji_reaction_broadcast', { emoji });
    // });

    // =======================================================
    // 4. MISSING PIECE: EMOJI REACTIONS 🚀
    // =======================================================
    socket.on('reaction', ({ roomCode, emoji }) => {
        console.log(`Reaction in ${roomCode}: ${emoji}`);
        // "Loudspeaker": Send to everyone in the room (Teacher AND Student)
        io.to(roomCode).emit('reaction_received', { 
            emoji, 
            id: Date.now() + Math.random() // Unique ID for animation
        });
    });
    // =======================================================

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});




env.config();


app.use(cors());

const port = process.env.PORT 

mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
})


app.use(express.json());
// app.use(mongoSanitize());

app.use(metricsMiddleware.requestMetricsMiddleware);

app.use('/api', pollRoutes);
app.use('/api', roomRoutes);
app.use('/api', userRoutes);
app.use('/metrics', metricRoutes);



server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})