import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const AdminRegisterEditor = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const { token } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");
		setError("");

		try {
			const res = await axios.post(
				"http://localhost:4000/api/auth/admin/register-editor",
				{ username, password },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			setMessage(res.data.message);
			setUsername("");
			setPassword("");
		} catch (err) {
			setError(err.response?.data?.message || "Registration failed");
		}
	};

	return (
		<div className="max-w-md mx-auto mt-12 bg-white p-6 shadow-md rounded-md">
			<h2 className="text-2xl font-bold mb-4 text-center">Register New Editor</h2>
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
				<button type="submit" className="w-full bg-roseclub-accent text-white py-2 rounded-md">
					Register Editor
				</button>
				{message && <p className="text-green-600 text-sm">{message}</p>}
				{error && <p className="text-red-500 text-sm">{error}</p>}
			</form>
		</div>
	);
};

export default AdminRegisterEditor;
