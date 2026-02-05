import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        if (this.socket) return this.socket;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'] // Explicit transports often help
        });

        this.socket.on('connect', () => {
            console.log('Socket Service: Connected', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket Service: Disconnected', reason);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }
}

const socketService = new SocketService();
export default socketService;
