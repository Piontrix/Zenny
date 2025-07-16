import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import API from "../../constants/api";
import axiosInstance from "../../api/axios";

const CreatorLogin = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await axiosInstance.post(API.CREATOR_LOGIN, { email, password });
			login(res.data.user);
			toast.success("🎉 Login successful");
			navigate("/chat");
		} catch (err) {
			console.error(err);
			const msg = err.response?.data?.message || "Login failed. Try again.";
			setError(msg);
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-20 p-6 shadow-lg bg-white rounded">
			<h2 className="text-2xl font-bold mb-4 text-center">Creator Login</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full px-4 py-2 border rounded"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full px-4 py-2 border rounded"
					required
				/>
				<button
					type="submit"
					disabled={loading}
					className="w-full bg-roseclub-accent text-white py-2 rounded hover:bg-roseclub-dark"
				>
					{loading ? "Logging in..." : "Login"}
				</button>
				{error && <p className="text-red-500 text-sm text-center">{error}</p>}
			</form>
			<p className="text-sm text-center mt-4">
				New here?{" "}
				<span className="text-roseclub-accent cursor-pointer underline" onClick={() => navigate("/register")}>
					Register
				</span>
			</p>
		</div>
	);
};

export default CreatorLogin;
