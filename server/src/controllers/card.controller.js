const Card = require('../models/Card');
const Column = require('../models/Column');
const Board = require('../models/Board');

// @desc    Create new card
// @route   POST /api/cards
// @access  Private
const createCard = async (req, res) => {
    try {
        const { title, columnId, boardId } = req.body;

        // Verify board access
        const board = await Board.findById(boardId);
        if (!board.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const count = await Card.countDocuments({ columnId });

        const card = await Card.create({
            title,
            columnId,
            boardId,
            order: count
        });

        const io = req.app.get('io');
        io.to(boardId).emit('card:created', card);

        res.status(201).json(card);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get card details
// @route   GET /api/cards/:id
// @access  Private
const getCard = async (req, res) => {
    try {
        const card = await Card.findById(req.params.id)
            .populate('assignees', 'username avatar')
            .populate('columnId')
        // Comments would be fetched separately or populated via virtuals if setup

        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        res.json(card);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update card
// @route   PUT /api/cards/:id
// @access  Private
const updateCard = async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const { title, description, dueDate, assignees, labels } = req.body;

        card.title = title || card.title;
        card.description = description !== undefined ? description : card.description;
        card.dueDate = dueDate || card.dueDate;
        if (assignees) card.assignees = assignees;
        if (labels) card.labels = labels;

        await card.save();

        const io = req.app.get('io');
        io.to(card.boardId.toString()).emit('card:updated', card);

        res.json(card);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Move card (between columns or reorder)
// @route   PUT /api/cards/:id/move
// @access  Private
const moveCard = async (req, res) => {
    try {
        const { columnId, order } = req.body;
        const card = await Card.findById(req.params.id);

        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        // Keep old values to detect changes
        const oldColumnId = card.columnId;
        const oldOrder = card.order;

        card.columnId = columnId || card.columnId;
        card.order = order !== undefined ? order : card.order;

        await card.save();

        // If moved columns, we might need to notify about that
        const io = req.app.get('io');
        io.to(card.boardId.toString()).emit('card:moved', {
            cardId: card._id,
            columnId: card.columnId,
            oldColumnId,
            order: card.order,
            card // send full card just in case
        });

        res.json(card);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Delete card
// @route   DELETE /api/cards/:id
// @access  Private
const deleteCard = async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        const boardId = card.boardId.toString(); // Save before delete
        const cardId = card._id;

        await card.deleteOne();

        const io = req.app.get('io');
        io.to(boardId).emit('card:deleted', cardId);

        res.json({ message: 'Card removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createCard,
    getCard,
    updateCard,
    deleteCard,
    moveCard
};
