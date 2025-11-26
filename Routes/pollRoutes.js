const express = require('express');
const router = express.Router();
const pollController = require('../Controllers/pollController');

router.get('/polls', pollController.getAllPolls);
router.post('/polls', pollController.createPoll);
router.get('/polls/:pollId', pollController.getPollDetails);
router.get('/polls/room/:roomCode', pollController.getPollByRoomCode);

module.exports = router;