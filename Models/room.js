const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomCode: { type: String, ref:'Poll', required: true},

    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    amenities: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);