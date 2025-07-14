import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true); // 👈 Add loading state

	// Load token and user from localStorage
	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
		}

		setLoading(false); // ✅ Hydration complete
	}, []);

	const login = (userData, token) => {
		setUser(userData);
		setToken(token);
		localStorage.setItem("user", JSON.stringify(userData));
		localStorage.setItem("token", token);
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
	};

	return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
