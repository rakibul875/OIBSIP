import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://server-navy-two-90.vercel.app';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log(`[WebSocket] Connected to server: ${socketInstance.id}`);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn(`[WebSocket Connection Warning]: ${err.message}`);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`[WebSocket] Disconnected: ${reason}`);
    });
  }

  return socketInstance;
};

export const joinOrderTrackingRoom = (orderId) => {
  const socket = getSocket();
  if (socket && orderId) {
    socket.emit('joinOrderRoom', orderId);
  }
};

export const leaveOrderTrackingRoom = (orderId) => {
  const socket = getSocket();
  if (socket && orderId) {
    socket.emit('leaveOrderRoom', orderId);
  }
};

export const joinAdminDispatchRoom = () => {
  const socket = getSocket();
  if (socket) {
    socket.emit('joinAdminRoom');
  }
};
