const Board = require('../models/Board');

/** Role hierarchy: admin > member > observer */
const ROLES = { admin: 3, member: 2, observer: 1 };

/**
 * Get role of user on board. Supports legacy members array (array of ObjectIds) as role 'member'.
 * @param {Object} board - Board document (plain or mongoose)
 * @param {string} userId - User id string
 * @returns {'admin'|'member'|'observer'|null}
 */
function getMemberRole(board, userId) {
    if (!board || !userId) return null;
    if (board.owner && board.owner.toString() === userId) return 'admin';

    const members = board.members || [];
    for (const m of members) {
        const uid = (m.user && m.user.toString && m.user.toString()) || (m && m.toString && m.toString());
        if (uid === userId) return (m.role && m.role in ROLES) ? m.role : 'member';
    }
    return null;
}

/**
 * Check if user can access board (view).
 */
function canView(role) {
    return !!role;
}

/**
 * Can edit board content: columns, cards, comments (member or admin).
 */
function canEdit(role) {
    return role === 'admin' || role === 'member';
}

/**
 * Can manage board settings and members (admin only).
 */
function canManageBoard(role) {
    return role === 'admin';
}

/**
 * Load board and get current user's role. Returns 404/403 via res if not allowed.
 * @returns Promise<{ board, role }> or null if res was used
 */
async function getBoardWithRole(boardId, userId, res) {
    const board = await Board.findById(boardId);
    if (!board) {
        if (res) res.status(404).json({ message: 'Board not found' });
        return null;
    }
    const role = getMemberRole(board, userId);
    if (!role) {
        if (res) res.status(403).json({ message: 'Not authorized to access this board' });
        return null;
    }
    return { board, role };
}

/**
 * Normalize members array to [{ user: populatedUser, role }] for API response.
 * Handles legacy members that are plain ObjectIds (treat as member).
 */
function normalizeMembersForResponse(board) {
    const members = (board.members || []).map((m) => {
        if (m.user && typeof m.user === 'object' && m.user._id) {
            return { _id: m.user._id, username: m.user.username, email: m.user.email, avatar: m.user.avatar, role: m.role || 'member' };
        }
        if (m.user && m.user.toString) {
            return { _id: m.user, role: m.role || 'member' };
        }
        return { _id: m, role: 'member' };
    });
    return members;
}

module.exports = {
    ROLES,
    getMemberRole,
    canView,
    canEdit,
    canManageBoard,
    getBoardWithRole,
    normalizeMembersForResponse
};
