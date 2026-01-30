const boardSocket = (io, socket) => {
    // Join Board Room
    socket.on('join-board', (boardId) => {
        socket.join(`board:${boardId}`);
        console.log(`User ${socket.user.username} joined board:${boardId}`);
    });

    // Leave Board Room
    socket.on('leave-board', (boardId) => {
        socket.leave(`board:${boardId}`);
        console.log(`User ${socket.user.username} left board:${boardId}`);
    });

    // Card Events
    socket.on('card:moved', (data) => {
        const { boardId, cardId, columnId, order } = data;
        // Broadcast to everyone in the room except sender
        socket.to(`board:${boardId}`).emit('card:moved', data);
    });

    socket.on('card:created', (data) => {
        const { boardId, card } = data;
        socket.to(`board:${boardId}`).emit('card:created', card);
    });

    socket.on('card:updated', (data) => {
        const { boardId, card } = data;
        socket.to(`board:${boardId}`).emit('card:updated', card);
    });

    socket.on('card:deleted', (data) => {
        const { boardId, cardId } = data;
        socket.to(`board:${boardId}`).emit('card:deleted', cardId);
    });

    // Column Events
    socket.on('column:created', (data) => {
        const { boardId, column } = data;
        socket.to(`board:${boardId}`).emit('column:created', column);
    });

    socket.on('column:updated', (data) => {
        const { boardId, column } = data;
        socket.to(`board:${boardId}`).emit('column:updated', column);
    });

    socket.on('column:deleted', (data) => {
        const { boardId, columnId } = data;
        socket.to(`board:${boardId}`).emit('column:deleted', columnId);
    });

    socket.on('column:reordered', (data) => {
        const { boardId, columnIds } = data;
        socket.to(`board:${boardId}`).emit('column:reordered', columnIds);
    });
};

module.exports = boardSocket;
