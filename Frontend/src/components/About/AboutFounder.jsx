import ImageWithLoader from "../common/ImageWithLoader";
import founderImg from "../../assets/aboutUsZenny.jpg"; // Update accordingly

const AboutFounder = () => {
	return (
		<div className="bg-[#fadacb] py-20 ">
			<div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-start">
				{/* Image */}
				<div className="relative z-0">
					<div className="rounded-xl overflow-hidden shadow-xl w-[300px] sm:w-[400px] lg:w-[450px]">
						<ImageWithLoader
							src={founderImg}
							alt="Zenny Co-Founder"
							className="w-full h-auto object-cover rounded-xl"
						/>
					</div>
				</div>

				{/* Floating Card */}
				<div className="relative z-10 lg:-ml-16 mt-8 lg:mt-0">
					<div className="bg-[#fff8f7] border border-[#d76767] rounded-xl shadow-lg px-6 sm:px-8 py-6 sm:py-8 max-w-4xl text-roseclub-dark">
						<h2 className="text-2xl sm:text-3xl font-romantic font-bold text-roseclub-medium mb-4">
							Discover Our Co-Founder 🪄
						</h2>
						<p className="text-base sm:text-lg leading-relaxed">
							Zenny was born from the chaos of ghosted edits, DM delays, and unclear collabs.
							<br />
							<br />
							Our co-founder envisioned a platform where creators and editors could finally vibe over talent, not
							followers — anonymously, safely, and smoothly.
							<br />
							<br />
							Today, that vision fuels every pixel of Zenny. And this is just the beginning.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AboutFounder;
