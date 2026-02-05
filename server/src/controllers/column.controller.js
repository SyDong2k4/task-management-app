const Column = require('../models/Column');
const Board = require('../models/Board');

// @desc    Create new column
// @route   POST /api/boards/:boardId/columns
// @access  Private
const createColumn = async (req, res) => {
    try {
        const { title } = req.body;
        const { boardId } = req.params;

        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Check member access
        if (!board.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get current count to set order
        const count = await Column.countDocuments({ boardId });

        const column = await Column.create({
            title,
            boardId,
            order: count
        });

        const io = req.app.get('io');
        io.to(boardId).emit('column:created', column);

        res.status(201).json(column);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update column
// @route   PUT /api/boards/:boardId/columns/:id
// @access  Private
const updateColumn = async (req, res) => {
    try {
        const { title } = req.body;
        const column = await Column.findById(req.params.id);

        if (!column) {
            return res.status(404).json({ message: 'Column not found' });
        }

        column.title = title || column.title;
        await column.save();

        const io = req.app.get('io');
        io.to(column.boardId.toString()).emit('column:updated', column);

        res.json(column);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete column
// @route   DELETE /api/boards/:boardId/columns/:id
// @access  Private
const deleteColumn = async (req, res) => {
    try {
        const column = await Column.findById(req.params.id);

        if (!column) {
            return res.status(404).json({ message: 'Column not found' });
        }

        const boardId = column.boardId.toString();
        const columnId = column._id;

        await column.deleteOne();

        // Ideally, also delete all cards in this column
        // await Card.deleteMany({ columnId: req.params.id });

        const io = req.app.get('io');
        io.to(boardId).emit('column:deleted', columnId);

        res.json({ message: 'Column removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reorder columns
// @route   PUT /api/boards/:boardId/columns/reorder
// @access  Private
const reorderColumns = async (req, res) => {
    try {
        const { columnIds } = req.body; // Array of column IDs in new order
        const { boardId } = req.params;

        if (!columnIds || !Array.isArray(columnIds)) {
            return res.status(400).json({ message: 'Invalid data' });
        }

        const updates = columnIds.map((id, index) => {
            return Column.findByIdAndUpdate(id, { order: index });
        });

        await Promise.all(updates);

        const io = req.app.get('io');
        io.to(boardId).emit('column:reordered', columnIds);

        res.json({ message: 'Columns reordered' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns
};
