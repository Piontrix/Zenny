import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const AdminLogin = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("http://localhost:4000/api/auth/admin/login", {
				username,
				password,
			});
			login(res.data.user, res.data.token);
			toast.success("🎉 Login successful");
			navigate("/admin/dashboard");
		} catch (err) {
			const msg = err.response?.data?.message || "Login failed";
			setError(msg);
			toast.error(msg);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-12 bg-white p-6 shadow-md rounded-md">
			<h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"
					className="w-full px-4 py-2 border rounded-md"
				/>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Password"
					className="w-full px-4 py-2 border rounded-md"
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
