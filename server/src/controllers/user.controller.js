const User = require('../models/User');

// @desc    Search users by username or email
// @route   GET /api/users/search?q=term
// @access  Private
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.json([]);
        }

        const regex = new RegExp(q.trim(), 'i');

        const users = await User.find({
            $or: [
                { username: regex },
                { email: regex }
            ],
            _id: { $ne: req.user.id },
        })
            .select('username email avatar')
            .limit(10);

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    searchUsers,
};

