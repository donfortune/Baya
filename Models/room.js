const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    // sessionCode: { type: String, required: true, unique: true },  // Like "H7K2MP"
    lecturerName: { type: String, required: true },
    courseName: { type: String, required: true },  // "CSC 201"
    polls: [{ type: Schema.Types.ObjectId, ref: 'Poll' }],  // Array of poll IDs
    currentActivePollId: { type: Schema.Types.ObjectId, ref: 'Poll' },  // Which poll is live
    activeUsers: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'closed'], default: 'active' }
}, { timestamps: true });


module.exports = mongoose.model('Room', roomSchema);