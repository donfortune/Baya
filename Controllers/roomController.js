const room = require('../Models/room');
const poll = require('../Models/poll');

exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await room.find({}).populate('roomCode', 'question options votes createdAt pollId');

        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ success: false, message: 'No rooms found' });
        }
        res.status(200).json({
            success: true,
            results: rooms.length,
            data: rooms
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}


exports.getAllRoomsCodes = async (req, res) => {
    try {
        const rooms = await room.find({}, 'roomCode -_id');

        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ success: false, message: 'No rooms found' });
        }

        const roomCodes = rooms.map(r => r.roomCode);

        res.status(200).json({
            success: true,
            data: roomCodes
        });
    } catch (error) {
        console.error('Error fetching room codes:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}