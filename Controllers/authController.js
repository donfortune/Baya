const user = require('../Models/user');
const jwt = require('jsonwebtoken');

function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await user.find({}, {
            name: 1,
            email: 1,
            createdAt: 1,
            _id: 0
        });

        if (users.length === 0 || !users) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}


exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = new user({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        const existingUser = await user.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await existingUser.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(existingUser._id);
        res.status(200).json({ token: token, 
            message: 'Login successful',
            name: existingUser.name,
            email: existingUser.email
         });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}