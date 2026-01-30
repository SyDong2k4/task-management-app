const Board = require('../models/Board');
const User = require('../models/User');

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res) => {
    try {
        const { title, description, background } = req.body;

        const board = await Board.create({
            title,
            description,
            background,
            owner: req.user.id,
            members: [req.user.id] // Owner is also a member
        });

        res.status(201).json(board);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all user's boards
// @route   GET /api/boards
// @access  Private
const getBoards = async (req, res) => {
    try {
        // Find boards where user is a member or owner
        const boards = await Board.find({
            members: req.user.id
        }).sort({ createdAt: -1 });

        res.json(boards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Private
const getBoardById = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id)
            .populate('members', 'username email avatar')
            .populate('owner', 'username email avatar');

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Check if user is member
        if (!board.members.some(member => member._id.toString() === req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to view this board' });
        }

        res.json(board);
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Board not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
const updateBoard = async (req, res) => {
    try {
        const { title, description, background } = req.body;
        let board = await Board.findById(req.params.id);

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Check ownership or membership (usually only admins/owners can update settings, but for now allow members or owner)
        // For strict ownership: if (board.owner.toString() !== req.user.id) ...
        // Let's allow owner to update
        if (board.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this board' });
        }

        board.title = title || board.title;
        board.description = description || board.description;
        board.background = background || board.background;

        await board.save();

        res.json(board);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
const deleteBoard = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Only owner can delete
        if (board.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this board' });
        }

        await board.deleteOne();

        res.json({ message: 'Board removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add member to board
// @route   POST /api/boards/:id/members
// @access  Private
const addMember = async (req, res) => {
    try {
        const { userId } = req.body; // or email
        const board = await Board.findById(req.params.id);

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Only owner or existing members can add? Let's say only owner for now
        if (board.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to add members' });
        }

        // Check if user exists
        const userToAdd = await User.findById(userId);
        if (!userToAdd) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already member
        if (board.members.includes(userId)) {
            return res.status(400).json({ message: 'User already a member' });
        }

        board.members.push(userId);
        await board.save();

        // Populate to return updated members
        await board.populate('members', 'username email avatar');

        res.json(board.members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Remove member from board
// @route   DELETE /api/boards/:id/members/:userId
// @access  Private
const removeMember = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Only owner can remove members
        if (board.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to remove members' });
        }

        // Cannot remove owner
        if (req.params.userId === board.owner.toString()) {
            return res.status(400).json({ message: 'Cannot remove owner from board' });
        }

        board.members = board.members.filter(member => member.toString() !== req.params.userId);
        await board.save();

        await board.populate('members', 'username email avatar');

        res.json(board.members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    createBoard,
    getBoards,
    getBoardById,
    updateBoard,
    deleteBoard,
    addMember,
    removeMember
};
