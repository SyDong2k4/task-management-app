const Board = require('../models/Board');
const User = require('../models/User');
const Column = require('../models/Column');
const Card = require('../models/Card');
const { getMemberRole, canManageBoard, getBoardWithRole } = require('../utils/boardPermission');

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
            members: [{ user: req.user.id, role: 'admin' }]
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
        const boards = await Board.find({
            $or: [
                { owner: req.user.id },
                { 'members.user': req.user.id }
            ]
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
        const result = await getBoardWithRole(req.params.id, req.user.id, res);
        if (!result) return;

        const { board, role } = result;
        await board.populate('members.user', 'username email avatar');
        await board.populate('owner', 'username email avatar');

        const membersForResponse = (board.members || []).map((m) => {
            const u = (m.user && m.user._id) ? m.user : (m._id ? m : null);
            const role = m.role || 'member';
            return u ? { _id: u._id, username: u.username, email: u.email, avatar: u.avatar, role } : { _id: m.user || m, role };
        });

        const columns = await Column.find({ boardId: board._id }).sort('order');
        const cards = await Card.find({ boardId: board._id }).sort('order');

        const columnsWithCards = columns.map(col => {
            const colCards = cards.filter(card => card.columnId.toString() === col._id.toString());
            return { ...col.toObject(), cards: colCards };
        });

        res.json({
            ...board.toObject(),
            owner: board.owner,
            members: membersForResponse,
            columns: columnsWithCards,
            currentUserRole: role
        });
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
// @access  Private (admin only)
const updateBoard = async (req, res) => {
    try {
        const result = await getBoardWithRole(req.params.id, req.user.id, res);
        if (!result) return;
        const { board, role } = result;
        if (!canManageBoard(role)) {
            return res.status(403).json({ message: 'Only admins can update board settings' });
        }

        const { title, description, background } = req.body;
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
// @access  Private (admin only)
const deleteBoard = async (req, res) => {
    try {
        const result = await getBoardWithRole(req.params.id, req.user.id, res);
        if (!result) return;
        const { board, role } = result;
        if (!canManageBoard(role)) {
            return res.status(403).json({ message: 'Only admins can delete the board' });
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
// @access  Private (admin only)
const addMember = async (req, res) => {
    try {
        const result = await getBoardWithRole(req.params.id, req.user.id, res);
        if (!result) return;
        const { board, role } = result;
        if (!canManageBoard(role)) {
            return res.status(403).json({ message: 'Only admins can add members' });
        }

        const { userId, role: newRole = 'member' } = req.body;
        const allowedRoles = ['admin', 'member', 'observer'];
        const roleToSet = allowedRoles.includes(newRole) ? newRole : 'member';

        const userToAdd = await User.findById(userId);
        if (!userToAdd) {
            return res.status(404).json({ message: 'User not found' });
        }

        const alreadyIn = (board.members || []).some(
            (m) => (m.user && m.user.toString()) === userId || m.toString() === userId
        );
        if (alreadyIn) {
            return res.status(400).json({ message: 'User already a member' });
        }

        board.members.push({ user: userId, role: roleToSet });
        await board.save();

        await board.populate('members.user', 'username email avatar');
        const membersForResponse = (board.members || []).map((m) => {
            const u = m.user && m.user._id ? m.user : null;
            return u ? { _id: u._id, username: u.username, email: u.email, avatar: u.avatar, role: m.role || 'member' } : { _id: m.user, role: m.role || 'member' };
        });

        // Notify the invited user that their boards list changed
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${userId}`).emit('boards:updated');
        }

        res.json(membersForResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove member from board
// @route   DELETE /api/boards/:id/members/:userId
// @access  Private (admin only)
const removeMember = async (req, res) => {
    try {
        const result = await getBoardWithRole(req.params.id, req.user.id, res);
        if (!result) return;
        const { board, role } = result;
        if (!canManageBoard(role)) {
            return res.status(403).json({ message: 'Only admins can remove members' });
        }

        if (req.params.userId === board.owner.toString()) {
            return res.status(400).json({ message: 'Cannot remove owner from board' });
        }

        board.members = (board.members || []).filter((m) => {
            const uid = (m.user && m.user.toString && m.user.toString()) || m.toString();
            return uid !== req.params.userId;
        });
        await board.save();

        await board.populate('members.user', 'username email avatar');
        const membersForResponse = (board.members || []).map((m) => {
            const u = m.user && m.user._id ? m.user : null;
            return u ? { _id: u._id, username: u.username, email: u.email, avatar: u.avatar, role: m.role || 'member' } : { _id: m.user, role: m.role || 'member' };
        });

        // Notify the removed user that their boards list changed
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.params.userId}`).emit('boards:updated');
        }

        res.json(membersForResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update member role
// @route   PUT /api/boards/:id/members/:userId
// @access  Private (admin only)
const updateMemberRole = async (req, res) => {
    try {
        const result = await getBoardWithRole(req.params.id, req.user.id, res);
        if (!result) return;
        const { board, role } = result;
        if (!canManageBoard(role)) {
            return res.status(403).json({ message: 'Only admins can change member roles' });
        }

        if (req.params.userId === board.owner.toString()) {
            return res.status(400).json({ message: 'Cannot change owner role' });
        }

        const { role: newRole } = req.body;
        const allowedRoles = ['admin', 'member', 'observer'];
        if (!allowedRoles.includes(newRole)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const memberEntry = (board.members || []).find((m) => {
            const uid = (m.user && m.user.toString && m.user.toString()) || m.toString();
            return uid === req.params.userId;
        });
        if (!memberEntry) {
            return res.status(404).json({ message: 'Member not found' });
        }

        memberEntry.role = newRole;
        await board.save();

        await board.populate('members.user', 'username email avatar');
        const membersForResponse = (board.members || []).map((m) => {
            const u = m.user && m.user._id ? m.user : null;
            return u ? { _id: u._id, username: u.username, email: u.email, avatar: u.avatar, role: m.role || 'member' } : { _id: m.user, role: m.role || 'member' };
        });

        // Notify the affected user that their boards list (and permissions) changed
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.params.userId}`).emit('boards:updated');
        }

        res.json(membersForResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createBoard,
    getBoards,
    getBoardById,
    updateBoard,
    deleteBoard,
    addMember,
    removeMember,
    updateMemberRole
};
