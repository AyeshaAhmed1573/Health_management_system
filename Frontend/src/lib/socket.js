import { io } from 'socket.io-client';
import { API_BASE, getStoredToken } from './session';

const SOCKET_URL = API_BASE.replace(/\/api\/?$/, '') || window.location.origin;

let socket = null;
let socketToken = null;

export function getSocket() {
  const token = getStoredToken();
  if (!token) return null;

  if (socket && socketToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    socketToken = token;
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketToken = null;
  }
}
