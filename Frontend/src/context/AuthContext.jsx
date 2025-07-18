import { createContext, useContext, useEffect, useState } from "react";
import API from "../constants/api";
import axiosInstance from "../api/axios";

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
				// 🧠 Retry with token from localStorage if cookie-based auth fails
				console.log(err);
				const localToken = localStorage.getItem("token");
				if (localToken) {
					try {
						const res = await axiosInstance.get("/me", {
							headers: {
								Authorization: `Bearer ${localToken}`,
							},
						});
						setUser(res.data.user);
					} catch (err) {
						console.warn("Token invalid or expired:", err.response?.data?.message || err.message);
						setUser(null);
					}
				} else {
					setUser(null);
				}
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
