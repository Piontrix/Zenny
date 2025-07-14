import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const VerifyOtp = () => {
	const [searchParams] = useSearchParams();
	const [otp, setOtp] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const email = searchParams.get("email");
	const navigate = useNavigate();

	const handleVerify = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await axios.post("http://localhost:4000/api/auth/creator/verify", {
				email,
				otp,
			});

			alert("✅ Email verified successfully!");
			navigate("/login");
		} catch (err) {
			console.error(err);
			setError(err.response?.data?.message || "Invalid OTP or Server Error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-20 p-6 shadow-lg bg-white rounded">
			<h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>
			<p className="text-sm text-center mb-4 text-gray-600">
				We’ve sent an OTP to <span className="font-semibold">{email}</span>
			</p>

			<form onSubmit={handleVerify} className="space-y-4">
				<input
					type="text"
					placeholder="Enter OTP"
					value={otp}
					onChange={(e) => setOtp(e.target.value)}
					className="w-full px-4 py-2 border rounded"
					required
				/>

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-roseclub-accent text-white py-2 rounded hover:bg-roseclub-dark"
				>
					{loading ? "Verifying..." : "Verify"}
				</button>

				{error && <p className="text-red-500 text-sm text-center">{error}</p>}
			</form>
		</div>
	);
};

export default VerifyOtp;
