const express = require('express');
const router = express.Router();
const roomController = require('../Controllers/roomController');

router.get('/rooms', roomController.getAllRooms);
router.get('/rooms/codes', roomController.getAllRoomsCodes);

module.exports = router;