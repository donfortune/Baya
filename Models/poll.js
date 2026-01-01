const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// generate poll id

function generatePollId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const pollSchema = new Schema({
    question: { type: String, required: true },
    roomCode: { type: String, required: true },
    pollId: {type: String, unique: true}, 
    voters: [{ type: String }], // Array of userIds who voted
    activeUsers: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    closedAt: { type: Date, default: null },
    options: [{ type: String }],  // ← Just text: ["36", "37"]
    votes: [{ type: Number, default: 0 }],  // ← Just counts: [0, 0],
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },// Poll creator
    is_deleted: { type: Boolean, default: false }
    
  
}, { timestamps: true });

pollSchema.pre('save', function(next) {
    if (!this.pollId) {
        this.pollId = generatePollId();
    }
    next();
});

pollSchema.pre("save", function (next) {
    // If votes array length doesn't match options, fix it
    if (this.votes.length !== this.options.length) {
        this.votes = this.options.map(() => 0);
    }
    next();
});


module.exports = mongoose.model('Poll', pollSchema);        


