import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// 🧠 Adjust this to your backend (localhost OR deployed)
const SOCKET_SERVER_URL = "http://localhost:4000"; // or your live URL

const SocketContext = createContext();

export const SocketProvider = ({ children, user }) => {
	const [isConnected, setIsConnected] = useState(false);
	const socketRef = useRef(null);

	useEffect(() => {
		if (user) {
			socketRef.current = io(SOCKET_SERVER_URL, {
				transports: ["websocket"],
				autoConnect: true,
			});

			socketRef.current.on("connect", () => {
				setIsConnected(true);
				console.log("🟢 Socket connected:", socketRef.current.id);
			});

			socketRef.current.on("disconnect", () => {
				setIsConnected(false);
				console.log("🔴 Socket disconnected");
			});

			return () => {
				socketRef.current.disconnect();
			};
		}
	}, [user]);

	return <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
