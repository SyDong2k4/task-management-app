import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const useBoardSocket = (boardId, callbacks = {}) => {
    const socket = useSocket();

    useEffect(() => {
        if (!socket || !boardId) return;

        // Join the board room
        socket.emit('join-board', boardId);

        // Listen for events
        const events = [
            'card:moved',
            'card:created',
            'card:updated',
            'card:deleted',
            'column:created',
            'column:updated',
            'column:deleted',
            'column:reordered'
        ];

        events.forEach(event => {
            if (callbacks[event]) {
                socket.on(event, callbacks[event]);
            }
        });

        // Cleanup
        return () => {
            events.forEach(event => {
                if (callbacks[event]) {
                    socket.off(event, callbacks[event]);
                }
            });
            socket.emit('leave-board', boardId);
        };
    }, [socket, boardId, callbacks]);
};

export default useBoardSocket;
