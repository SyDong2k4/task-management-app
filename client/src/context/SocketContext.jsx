import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { token, user } = useAuth();

    useEffect(() => {
        if (token && user) {
            const newSocket = socketService.connect(token);
            setSocket(newSocket);

            return () => {
                socketService.disconnect();
                setSocket(null);
            };
        } else {
            // User logged out or init
            socketService.disconnect();
            setSocket(null);
        }
    }, [token, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
