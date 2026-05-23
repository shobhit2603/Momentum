"use client";

import { io } from "socket.io-client";

let socketInstance = null;

const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

export const connectSocket = (token) => {
  if (!token) return null;
  if (socketInstance) {
    socketInstance.auth = { token };
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  socketInstance = io(getSocketUrl(), {
    auth: { token },
    withCredentials: true,
    transports: ["websocket"],
  });
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
