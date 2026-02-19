const express = require('express');
const router = express.Router();
const pollController = require('../Controllers/pollController');
const authMiddleware = require('../Middlewares/authMiddleware');
const rateLimiter = require('../Middlewares/rateLimiter')

router.get('/polls', rateLimiter.apiLimiter, pollController.getAllPolls);
/**
 * @swagger
 * /polls:
 *   post:
 *     summary: Create a new poll
 *     tags: [Polls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *     responses:
 *       201:
 *         description: The poll was created
 *       401:
 *         description: Unauthorized
 */

router.post('/polls', authMiddleware.protectRoutes, rateLimiter.apiLimiter, pollController.createPoll);
router.get('/polls/:pollId', pollController.getPollDetails);
router.get('/polls/room/:roomCode', pollController.getPollByRoomCode); 
router.patch('/polls/:pollId/status', authMiddleware.protectRoutes, pollController.updatePollStatus);
router.post('/polls/:pollId/vote', pollController.votePoll);
router.post('/polls/:pollId/ResetVotes', pollController.resetVotes);
router.get('/polls/user/:userId', authMiddleware.protectRoutes, pollController.getAllPollsByUser);
router.delete('/polls/:pollId', authMiddleware.protectRoutes, pollController.deletePoll);


module.exports = router;