import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';

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
            socket.on(event, (data) => {
                // Check if there is a specific callback
                if (callbacks[event]) {
                    callbacks[event](data);
                }

                // Default notification logic (could be refined to avoid duplicate toasts if callback also notifies)
                // For now, let's just log and toast specific interesting events
                if (event === 'card:created') toast.success('New card created!');
                if (event === 'column:created') toast.success('New column created!');
                if (event === 'card:moved') {
                    // Optional: toast.info('Card moved'); 
                }
            });
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
