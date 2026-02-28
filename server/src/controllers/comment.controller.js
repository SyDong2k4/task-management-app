const Comment = require('../models/Comment');
const Card = require('../models/Card');
const { getBoardWithRole, canEdit } = require('../utils/boardPermission');

// @desc    Get comments for a card
// @route   GET /api/comments/:cardId
// @access  Private (any board member)
const getComments = async (req, res) => {
    try {
        const card = await Card.findById(req.params.cardId);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        const result = await getBoardWithRole(card.boardId.toString(), req.user.id, res);
        if (!result) return;

        const comments = await Comment.find({ cardId: req.params.cardId })
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add a comment
// @route   POST /api/comments/:cardId
// @access  Private (member or admin)
const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const cardId = req.params.cardId;

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const result = await getBoardWithRole(card.boardId.toString(), req.user.id, res);
        if (!result) return;
        if (!canEdit(result.role)) {
            return res.status(403).json({ message: 'Observers cannot add comments' });
        }

        const comment = await Comment.create({
            content,
            cardId,
            author: req.user.id
        });

        // Populate author info for immediate display
        await comment.populate('author', 'username avatar');

        const io = req.app.get('io');
        // Emit to the board room so anyone viewing the board/card gets updates
        io.to(`board:${card.boardId.toString()}`).emit('comment:added', comment);

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (comment author or member/admin)
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const card = await Card.findById(comment.cardId);
        if (!card) return res.status(404).json({ message: 'Card not found' });
        const result = await getBoardWithRole(card.boardId.toString(), req.user.id, res);
        if (!result) return;
        const isAuthor = comment.author.toString() === req.user.id;
        if (!isAuthor && !canEdit(result.role)) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        const card = await Card.findById(comment.cardId);
        const boardId = card.boardId.toString();

        await comment.deleteOne();

        const io = req.app.get('io');
        io.to(`board:${boardId}`).emit('comment:deleted', comment._id);

        res.json({ message: 'Comment removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getComments,
    addComment,
    deleteComment
};
