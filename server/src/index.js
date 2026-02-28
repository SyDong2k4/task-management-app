const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const initSocket = require('./sockets/socket');

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const boardRoutes = require('./routes/board.routes');
const columnRoutes = require('./routes/column.routes');
const userRoutes = require('./routes/user.routes');

const cardRoutes = require('./routes/card.routes');
const commentRoutes = require('./routes/comment.routes');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards/:boardId/columns', columnRoutes);

app.use('/api/cards', cardRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
    res.send('Task Management API is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
