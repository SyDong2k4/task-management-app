const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a card title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    columnId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Column',
        required: true
    },
    boardId: { // Denormalization for easier queries
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    assignees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dueDate: {
        type: Date
    },
    labels: [{
        text: String,
        color: String
    }],
    order: {
        type: Number,
        required: true,
        default: 0
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Card', cardSchema);
