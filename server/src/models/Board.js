const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a board title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Trello-like: admin = full; member = edit cards/columns; observer = read-only
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['admin', 'member', 'observer'], default: 'member' }
    }],
    background: {
        type: String,
        default: '#ffffff' // Default white or can be an image URL
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Board', boardSchema);
