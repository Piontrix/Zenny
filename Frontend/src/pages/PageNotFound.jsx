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
		<section className="min-h-screen flex items-center justify-center bg-roseclub-bg text-center px-6">
			<div className="bg-roseclub-paper/70 backdrop-blur-lg border border-roseclub-medium/20 p-8 rounded-2xl shadow-xl max-w-lg w-full space-y-6">
				<h1 className="text-6xl font-extrabold text-roseclub-dark font-romantic drop-shadow-sm">404</h1>

				<p className="text-xl font-medium text-roseclub-medium">Sorry, this page doesn’t exist 💔</p>

				<p className="text-roseclub-accent font-semibold">
					Redirecting to Home in <span className="text-roseclub-dark font-bold">{countdown}</span>...
				</p>

				<button onClick={() => navigate("/")} className="buttonStyle mt-4">
					Go To Home Now
				</button>
			</div>
		</section>
	);
};

export default PageNotFound;
