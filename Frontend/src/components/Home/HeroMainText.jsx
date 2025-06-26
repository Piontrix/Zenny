import { Link } from "react-router-dom";

const HeroMainText = ({ onOpenModal }) => {
	return (
		<div className="z-10 max-w-2xl space-y-6 text-roseclub-dark text-center">
			<h1 className="text-4xl sm:text-5xl font-extrabold drop-shadow-sm leading-snug">
				Where Creators & Editors Meet 💌
			</h1>

			<p className="text-xl sm:text-2xl font-bold text-roseclub-dark leading-relaxed drop-shadow-sm">
				At <span className="font-extrabold text-roseclub-accent">Zenny</span>, we help you turn imagination into reality
				— without revealing your identity. Anonymous. Seamless. Real work.
			</p>

			<div className="flex justify-center gap-4 flex-wrap">
				<Link to="/about">
					<button className="px-6 py-2 bg-roseclub-accent text-white rounded-full hover:bg-roseclub-dark transition font-semibold shadow-md">
						Learn More
					</button>
				</Link>
				<button
					onClick={onOpenModal}
					className="px-6 py-2 border border-roseclub-accent text-roseclub-accent hover:bg-roseclub-accent hover:text-white rounded-full transition font-semibold shadow-md"
				>
					Get Started 🚀
				</button>
			</div>
		</div>
	);
};

export default HeroMainText;
