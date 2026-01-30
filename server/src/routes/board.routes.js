const express = require('express');
const router = express.Router();
const {
    createBoard,
    getBoards,
    getBoardById,
    updateBoard,
    deleteBoard,
    addMember,
    removeMember
} = require('../controllers/board.controller');
const { protect } = require('../middleware/auth');

router.use(protect); // All board routes are protected

router.route('/')
    .get(getBoards)
    .post(createBoard);

router.route('/:id')
    .get(getBoardById)
    .put(updateBoard)
    .delete(deleteBoard);

router.route('/:id/members')
    .post(addMember);

router.route('/:id/members/:userId')
    .delete(removeMember);

module.exports = router;
