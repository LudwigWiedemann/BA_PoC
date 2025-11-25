import { io } from "socket.io-client";

// const API_BASE = "http://18.192.38.120:4000";
const API_BASE = import.meta.env.VITE_API_BASE;

export const socket = io(API_BASE, {
    autoConnect: true,
    transports: ["websocket"],
});