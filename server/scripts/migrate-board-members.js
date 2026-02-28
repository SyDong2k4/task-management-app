/**
 * One-time migration: convert Board.members from [ObjectId] to [{ user: ObjectId, role: 'member' }].
 * Run from server folder: node scripts/migrate-board-members.js
 * Requires MONGO_URI in .env or environment.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Board = require('../src/models/Board');

const migrate = async () => {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    const boards = await Board.find({});
    let updated = 0;
    for (const board of boards) {
        const members = board.members || [];
        const needsMigration = members.some((m) => !m || !m.user);
        if (!needsMigration) continue;
        const newMembers = members.map((m) => {
            if (m && m.user) return m;
            const userId = m && (m._id || m);
            return { user: userId, role: 'member' };
        });
        board.members = newMembers;
        await board.save();
        updated++;
    }
    console.log(`Migrated ${updated} board(s).`);
    await mongoose.disconnect();
    process.exit(0);
};

migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});
