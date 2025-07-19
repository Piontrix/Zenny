import { createContext, useContext, useEffect, useState } from "react";
import API from "../constants/api";
import axiosInstance from "../api/axios";
import LoaderSpinner from "../components/common/LoaderSpinner";

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
		setUser(userData);
	};

	const logout = async () => {
		try {
			await axiosInstance.post("/api/auth/logout");
			setUser(null);
		} catch (err) {
			console.error("Logout error:", err.response?.data?.message || err.message);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-roseclub-paper">
				<LoaderSpinner size="lg" />
			</div>
		);
	}

	return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
