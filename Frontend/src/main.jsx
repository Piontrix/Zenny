import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const mockUser = {
	_id: "64abc123...",
	role: "creator",
	username: "creatorX",
};

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<AuthProvider>
			<SocketProvider user={mockUser}>
				<App />
			</SocketProvider>
		</AuthProvider>
	</StrictMode>
);
