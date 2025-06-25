import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
	const [countdown, setCountdown] = useState(3);
	const navigate = useNavigate();

	useEffect(() => {
		if (countdown === 0) {
			navigate("/");
		}

		const timer = setTimeout(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [countdown, navigate]);

	return (
		<section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-50 text-center px-6">
			<div className="bg-white/30 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl max-w-lg w-full space-y-6">
				<h1 className="text-5xl font-bold text-zenny-dark drop-shadow-sm">404</h1>
				<p className="text-lg text-gray-800 font-medium">Sorry, this page doesn’t exist.</p>

				<p className="text-pink-600 font-semibold">
					Redirecting to Home in <span className="text-zenny-highlight">{countdown}</span>...
				</p>

				<button
					onClick={() => navigate("/")}
					className="mt-4 px-6 py-2 bg-zenny-accent text-white rounded-full hover:bg-zenny-dark transition font-semibold shadow-md"
				>
					Go To Home Now
				</button>
			</div>
		</section>
	);
};

export default PageNotFound;
