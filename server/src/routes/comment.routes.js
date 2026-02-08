const express = require('express');
const router = express.Router();
const {
    getComments,
    addComment,
    deleteComment
} = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:cardId', getComments);
router.post('/:cardId', addComment);
router.delete('/:id', deleteComment);

module.exports = router;
