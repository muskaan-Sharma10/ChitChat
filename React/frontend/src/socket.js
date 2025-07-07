// Make sure to run: npm install socket.io-client
import { io } from "socket.io-client";

// Use the correct backend URL and port
export const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  withCredentials: true,
  reconnection: true,
});
