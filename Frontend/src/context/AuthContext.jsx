import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axios"; // ✅ use named axios instance
import API from "../constants/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axiosInstance.get("/me");
				setUser(res.data.user);
			} catch (err) {
				console.warn("Not logged in:", err.response?.data?.message || err.message);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, []);

	const login = (userData) => {
		setUser(userData); // token is in httpOnly cookie
	};

	const logout = async () => {
		try {
			await axiosInstance.post("/api/auth/logout");
			setUser(null);
		} catch (err) {
			console.error("Logout error:", err.response?.data?.message || err.message);
		}
	};

	return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
