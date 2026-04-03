import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

// We export a function to initialize the socket so we can control when it connects
export const socket = io(SOCKET_URL, {
  autoConnect: false, 
});