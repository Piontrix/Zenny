import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import API from "../../constants/api";
import axiosInstance from "../../api/axios"; // ✅ centralized instance
import { handleTokenFallback } from "../../../utils/tokenFallback";

const AdminLogin = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const res = await axiosInstance.post(API.ADMIN_LOGIN, { username, password });
			login(res.data.user);
			await handleTokenFallback(res.data.token);
			toast.success("🎉 Login successful");
			navigate("/admin/dashboard");
		} catch (err) {
			const msg = err.response?.data?.message || "Login failed";
			setError(msg);
			toast.error(msg);
		}
	};

	return (
		<div className="max-w-md mx-auto my-20 bg-white p-6 shadow-md rounded-md">
			<h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"
					className="w-full px-4 py-2 border rounded-md"
					required
				/>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Password"
					className="w-full px-4 py-2 border rounded-md"
					required
				/>
				{error && <p className="text-red-500 text-sm">{error}</p>}
				<button type="submit" className="w-full bg-roseclub-accent text-white py-2 rounded-md">
					Login
				</button>
			</form>
		</div>
	);
};

export default AdminLogin;
