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

        // Logic to shift other cards if necessary is complex for backend only without bulk updates from frontend
        // Assuming frontend sends the new state or we just update this single card properties

        card.columnId = columnId || card.columnId;
        card.order = order !== undefined ? order : card.order;

        await card.save();

        // In a real app, you'd likely want to shift orders of other cards in the destination column
        // But for simplicity of this request, we update this one.

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

        await card.deleteOne();
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
