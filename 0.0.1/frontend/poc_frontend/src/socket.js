import { io } from "socket.io-client";

const API_BASE = "http://localhost:4000";
export const socket = io(API_BASE, {
    autoConnect: true,
});