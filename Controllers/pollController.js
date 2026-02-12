const poll = require('../Models/poll');
const { pollVotes } = require('../Metrics/metrics');
const logger = require('../logger');


exports.getAllPolls = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const skip = (page - 1) * limit; 



        const polls = await poll.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

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
            status: p.status,
            user: p.user
        }));

        res.status(200).json({
            success: true,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(await poll.countDocuments() / limit),
                pageSize: limit
            },
            data: formatted
        });

    } catch (error) {
        console.error('Error fetching polls:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


exports.createPoll = async (req, res) => {
    console.log("👉 createPoll Triggered");
    console.log("📥 Payload:", req.body);
    
    try {
        // Check User Auth
        if (!req.user || !req.user._id) {
            console.error("Error: User not authenticated in request");
            return res.status(401).json({ message: "User authentication failed" });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            console.error("Error: Empty Body");
            return res.status(400).json({ message: "Request body is missing" });
        }

        const { question, options, roomCode, isStrict } = req.body;

        if (!question || !options || options.length < 2) {
            console.error("Error: Validation Failed (Question/Options)");
            return res.status(400).json({ message: "Invalid poll data" });
        }

        // Room Code Logic
        const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
        let finalRoomCode = roomCode;

        if (!finalRoomCode) {
            finalRoomCode = generateRoomCode();
            console.log("✨ Generated New Room Code:", finalRoomCode);
        } else {
            console.log("🔍 Checking Existing Room:", finalRoomCode);
            
            const existingPoll = await poll.findOne({ roomCode: finalRoomCode });
            if (!existingPoll) {
                console.error("Error: Room Code not found");
                return res.status(400).json({ message: `Room code ${finalRoomCode} does not exist` });
            }
        }

        console.log("Saving to Database...");
        
        
        const newPoll = new poll({
            user: req.user._id,
            question,
            roomCode: finalRoomCode,
            options,
            isStrict: isStrict || false,
            votedUserIds: [] 
        });

        const savedPoll = await newPoll.save();
        console.log("Poll Saved:", savedPoll._id);

        // Socket
        const io = req.app.get('io');
        if (io) {
            io.to(finalRoomCode).emit('poll_updated', savedPoll);
        }
        
        res.status(201).json(savedPoll);

    } catch (error) {
        console.error("CRITICAL SERVER ERROR:", error);
        res.status(500).json({ message: "Server Error: " + error.message });
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

      
        const updated = await poll.findByIdAndUpdate(
            pollId, 
            { status, closedAt: status === "closed" ? new Date() : null },
            { new: true } 
        );

        if (!updated) {
            return res.status(404).json({ message: "Poll not found" });
        }

     
        const io = req.app.get('io');
        if (io) {
            io.to(updated.roomCode).emit('poll_updated', updated);
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
        const { option, studentId } = req.body; 

        
        const pollDetails = await poll.findById(pollId);

        if (!pollDetails) {
            return res.status(404).json({ message: "Poll not found" });
        }

        if (pollDetails.status !== "active") {
            return res.status(400).json({ message: "Poll is not active" });
        }

      
        if (pollDetails.isStrict) {
            if (!studentId || studentId.trim() === "") {
                return res.status(400).json({ message: "Identity Required: Please enter your Student ID." });
            }
            
    
            const normalizedId = studentId.toLowerCase().trim();
            
            
            if (pollDetails.votedUserIds.includes(normalizedId)) {
                return res.status(403).json({ message: "⛔ Duplicate Vote: This Student ID has already voted." });
            }
            
            
            pollDetails.votedUserIds.push(normalizedId);
        }
        

        const optionIndex = pollDetails.options.indexOf(option);
        if (optionIndex === -1) {
            return res.status(400).json({ message: "Invalid option" });
        }

      
        pollDetails.votes[optionIndex] += 1;

        await pollDetails.save();

        const currentTotalVotes = pollDetails.votes.reduce((a, b) => a + b, 0); 

        // Logging
        logger.info({
            message: 'Vote Cast',
            pollId: pollDetails._id,
            question: pollDetails.question,
            votes: currentTotalVotes,
            type: pollDetails.isStrict ? 'Strict' : 'Casual', 
            service: 'poll-service' 
        });

      
        if (typeof pollVotes !== 'undefined') { 
            pollVotes.set(
                { pollId: pollDetails._id.toString(), question: pollDetails.question }, 
                currentTotalVotes
            );
            console.log(`📊 Metric Updated: Poll "${pollDetails.question}" now has ${currentTotalVotes} votes.`);
        }

        
        const io = req.app.get('io');
        if (io) {
            io.to(pollDetails.roomCode).emit('poll_updated', pollDetails);
        }

        res.status(200).json({
            message: "Vote recorded",
            poll: pollDetails
        });

    } catch (error) {
        console.error("Error voting on poll:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.resetVotes = async (req, res) => {
    try {
        const { pollId } = req.params;

        const pollDetails = await poll.findOne({ pollId });

        if (!pollDetails) {
            return res.status(404).json({ message: "Poll not found" });
        }

      
        pollDetails.votes = pollDetails.options.map(() => 0);
        pollDetails.voters = [];

        await pollDetails.save();

        res.status(200).json({
            message: "Votes cleared",
            poll: pollDetails
        });
    } catch (error) {
        console.log("Error clearing votes:", error);
        res.status(500).json({ message: "Server Error" });
    }
}


exports.getAllPollsByUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const polls = await poll.find({ user: userId });

        if (!polls || polls.length === 0) {
            return res.status(404).json({ message: 'No polls found for this user' });
        }

        res.status(200).json({
            status: 'success',
            results: polls.length,
            data: polls
        });
    } catch (error) {
        console.error('Error fetching polls by user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}


exports.deletePoll = async (req, res) => {
    try {
        const { pollId } = req.params;

        const pollDetails = await poll.findByIdAndUpdate(
            pollId,
            { is_deleted: true },
            { new: true }
        );

        if (!pollDetails) {
            return res.status(404).json({ message: "Poll not found" });
        }

        res.status(200).json({
            message: "Poll deleted (soft delete)",
            poll: pollDetails
        });
    } catch (error) {
        console.error("Error deleting poll:", error);
        res.status(500).json({ message: "Server Error" });
    }
}