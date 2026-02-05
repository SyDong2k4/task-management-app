import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const useSocketEvent = (eventName, callback) => {
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        if (!eventName || !callback) return;

        socket.on(eventName, callback);

        return () => {
            socket.off(eventName, callback);
        };
    }, [socket, eventName, callback]);
};

export default useSocketEvent;
