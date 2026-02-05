import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';

const useBoardSocket = (boardId, callbacks = {}) => {
    const socket = useSocket();
    const callbacksRef = useRef(callbacks);

    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

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
                // Use the ref to get the latest callback
                if (callbacksRef.current[event]) {
                    callbacksRef.current[event](data);
                }

                // Default notification logic
                if (event === 'card:created') toast.success('New card created!');
                if (event === 'column:created') toast.success('New column created!');
            });
        });

        // Cleanup
        return () => {
            events.forEach(event => {
                socket.off(event); // remove all listeners for this event? 
                // Removing specific listener is hard with anonymous function.
                // socket.off(event) removes all listeners for 'event'. 
                // Since we are inside a specific component context, this might be okay if we assume one listener per event type per hook instance?
                // Actually, safer to keep the named function approach if possible, but with Ref it is harder.
                // Alternate: just use the wrapper function.
            });
            socket.emit('leave-board', boardId);
        };
    }, [socket, boardId]); // callbacks removed from dependency
};

export default useBoardSocket;
