const express = require('express');
const router = express.Router();
const pollController = require('../Controllers/pollController');
const authMiddleware = require('../Middlewares/authMiddleware');
const rateLimiter = require('../Middlewares/rateLimiter')

router.get('/polls', rateLimiter.apiLimiter, pollController.getAllPolls);
router.post('/polls', authMiddleware.protectRoutes, rateLimiter.apiLimiter, pollController.createPoll);
router.get('/polls/:pollId', pollController.getPollDetails);
router.get('/polls/room/:roomCode', pollController.getPollByRoomCode); 
router.patch('/polls/:pollId/status', authMiddleware.protectRoutes, pollController.updatePollStatus);
router.post('/polls/:pollId/vote', pollController.votePoll);
router.post('/polls/:pollId/ResetVotes', pollController.resetVotes);
router.get('/polls/user/:userId', authMiddleware.protectRoutes, pollController.getAllPollsByUser);
router.delete('/polls/:pollId', authMiddleware.protectRoutes, pollController.deletePoll);


module.exports = router;