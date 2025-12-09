const express = require('express');
const env = require('dotenv')
const mongoose = require('mongoose');
const pollRoutes = require('./Routes/pollRoutes');
const roomRoutes = require('./Routes/roomRoutes')
const userRoutes = require('./Routes/userRoutes');
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
app.use('/api', pollRoutes);
app.use('/api', roomRoutes);
app.use('/api', userRoutes);



server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})