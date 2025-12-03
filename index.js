const express = require('express');
const env = require('dotenv')
const mongoose = require('mongoose');
const pollRoutes = require('./Routes/pollRoutes');
const roomRoutes = require('./Routes/roomRoutes')
const cors = require('cors');




env.config();
const app = express();

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


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})