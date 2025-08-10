import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axios"; // ✅ using configured instance
import API from "../constants/api";

const CreatorRegister = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleRegister = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await axiosInstance.post(API.CREATOR_REGISTER, {
				email,
				password,
			});
			// console.log(res);
			toast.success(res?.data?.message ? res?.data?.message : "OTP sent to your email. Please verify.");
			navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
		} catch (err) {
			console.error(err);
			const msg = err.response?.data?.message || "Something went wrong";
			setError(msg);
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto my-20 p-6 shadow-lg bg-white rounded">
			<h2 className="text-2xl font-bold mb-4 text-center">Creator Register</h2>
			<form onSubmit={handleRegister} className="space-y-4">
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
					{loading ? "Registering..." : "Register"}
				</button>
				{error && <p className="text-red-500 text-sm text-center">{error}</p>}
			</form>
		</div>
	);
};

export default CreatorRegister;
