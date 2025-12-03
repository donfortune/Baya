const poll = require('../Models/poll');

// exports.getAllPolls = async (req, res) => {
//     try {
//         const polls = await poll.find({}, {
//             question: 1,
//             options: 1,
//             roomCode: 1,
//             status: 1,
//             createdAt: 1,
//             pollId: 1,
//             _id: 0
//         });

//         if (polls.length === 0 || !polls) {
//             return res.status(404).json({ message: 'No polls found' });
//         }
//         res.status(200).json({
//             status: 'success',
//             results: polls.length,
//             data: polls
//         });
//     } catch (error) {
//         console.error('Error fetching polls:', error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// }

exports.getAllPolls = async (req, res) => {
    try {
        const polls = await poll.find({});

        if (!polls || polls.length === 0) {
            return res.status(404).json({ success: false, message: 'No polls found' });
        }

        const formatted = polls.map(p => ({
            pollId: p.pollId,
            roomCode: p.roomCode,
            title: p.question,
            options: p.options,
            votes: p.votes,
            createdAt: p.createdAt,
            status: p.status
        }));

        res.status(200).json({
            success: true,
            data: formatted
        });

    } catch (error) {
        console.error('Error fetching polls:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};



// exports.createPoll = async (req, res) => {
//     try {

//         if (!req.body || Object.keys(req.body).length === 0) {
//             return res.status(400).json({ message: 'Request body is missing' });
//         }

//         const { question, options } = req.body;

//         if (!question || !options || options.length < 2) {
//             return res.status(400).json({ message: 'Invalid poll data' });
//         }

       
//         // generate a unique room code for the poll
//         const generateRoomCode = () => {
//             return Math.random().toString(36).substring(2, 8).toUpperCase();
//         }

//         let finalCode = roomCode

//         if (!finalCode) {
//             finalCode = generateRoomCode();
//         } else {
//             const existingPoll = await poll.findOne({ roomCode: finalCode });
//             if (existingPoll) {
//                 return res.status(400).json({ message: 'Room code already exists. Please choose a different one.' });
//             }
//         }
        
//         // const newPoll = new poll({
//         //     question,
//         //     roomCode: generateRoomCode(),
//         //     options: options.map(option => ({ option, votes: 0 })),
//         //     votes: votes.map(option => ({ option, votes: 0 }))
//         // });
//         const newPoll = new poll({
//             question,
//             roomCode: generateRoomCode(),
//             // pollId,
//             options,
            
//         });

//         const savedPoll = await newPoll.save();
//         res.status(201).json(savedPoll);
//     } catch (error) {
//         console.error('Error creating poll:', error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// }

exports.createPoll = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Request body is missing" });
        }

        const { question, options, roomCode } = req.body;

        if (!question || !options || options.length < 2) {
            return res.status(400).json({ message: "Invalid poll data" });
        }

        // Utility to generate new room code (only if needed)
        const generateRoomCode = () =>
            Math.random().toString(36).substring(2, 8).toUpperCase();

        let finalRoomCode = roomCode;

        // If roomCode is not provided, create a new one
        if (!finalRoomCode) {
            finalRoomCode = generateRoomCode();
        } else {
            // If roomCode WAS provided, check if it exists
            const existingPoll = await poll.findOne({ roomCode: finalRoomCode });

            if (!existingPoll) {
                return res.status(400).json({
                    message: `Room code ${finalRoomCode} does not exist`,
                });
            }
        }

        await poll.updateMany(
            { roomCode: finalRoomCode, status: "active" },
            { status: "closed", closedAt: new Date() }
        );

        // Create the poll
        const newPoll = new poll({
            question,
            roomCode: finalRoomCode,
            options,
        });

        const savedPoll = await newPoll.save();
        res.status(201).json(savedPoll);

    } catch (error) {
        console.error("Error creating poll:", error);
        res.status(500).json({ message: "Server Error" });
    }
};



exports.getPollDetails = async (req, res) => {
    try {
        const { pollId } = req.params;
        const pollDetails = await poll.findOne({ pollId: pollId });

        if (!pollDetails) {
            const err = new Error(`Poll with ID ${pollId} not found`);
            err.status = 404;
            throw err;
        }

        res.status(200).json({
            status: 'success',
            data: pollDetails
        });
    } catch (error) {
        console.error('Error fetching poll details:', error);
        res.status(500).json({
            success: false,
            error: {
                code: error.code,
                message: error.message
            }
        });
    }
}

exports.getPollByRoomCode = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const pollDetails = await poll.find({ roomCode: roomCode });

        if (!pollDetails) {
            return res.status(404).json({ success: false, message: `Poll with Room Code ${roomCode} not found` });
        }

        res.status(200).json({
            success: true,
            data: pollDetails
        });
    } catch (error) {
        console.error('Error fetching poll by room code:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}


exports.updatePollStatus = async (req, res) => {
    try {
        const { pollId } = req.params;
        const { status } = req.body;

        if (!["active", "closed"].includes(status)) {
            return res.status(400).json({
                message: "Status must be 'active' or 'closed'"
            });
        }

        const updated = await poll.findOneAndUpdate(
            { pollId },
            { status, closedAt: status === "closed" ? new Date() : null },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Poll not found" });
        }

        res.status(200).json(updated);

    } catch (error) {
        console.error("Error updating poll status:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


exports.votePoll = async (req, res) => {
    try {
        const { pollId } = req.params;
        const { option } = req.body;
        // const voterId = req.ip; // or req.user.id if authenticated

        const { userId } = req.body;  // Get from request body
        const voterId = userId || req.ip;  // Fallback to IP if no userId

        const pollDetails = await poll.findOne({ pollId });

        if (!pollDetails) {
            return res.status(404).json({ message: "Poll not found" });
        }

        if (pollDetails.status !== "active") {
            return res.status(400).json({ message: "Poll is not active" });
        }

        const optionIndex = pollDetails.options.indexOf(option);
        if (optionIndex === -1) {
            return res.status(400).json({ message: "Invalid option" });
        }

        // Prevent double voting
        // if (pollDetails.voters.includes(voterId)) {
        //     return res.status(400).json({ message: "You have already voted" });
        // }

        // Add voter
        pollDetails.voters.push(voterId);

        // Increment vote count
        pollDetails.votes[optionIndex] += 1;

        await pollDetails.save();

        res.status(200).json({
            message: "Vote recorded",
            poll: pollDetails
        });

    } catch (error) {
        console.error("Error voting on poll:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

