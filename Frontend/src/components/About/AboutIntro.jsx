import React from "react";
import aboutImg from "../../assets/aboutUsZenny.jpg";

const AboutIntro = () => {
	return (
		<div className="flex flex-col md:flex-row items-center gap-12">
			{/* Text */}
			<div className="md:w-1/2 space-y-6 text-center md:text-left">
				<h1 className="text-4xl sm:text-5xl font-romantic text-roseclub-accent drop-shadow-sm">
					About <span className="text-roseclub-medium">Zenny</span>
				</h1>

				<p className="text-base sm:text-lg leading-relaxed">
					At Zenny, we believe creative work should be simple, seamless, and stress-free. Our platform connects content
					creators with verified video editors — making collaboration easy, secure, and completely anonymous.
				</p>

				<p className="text-base sm:text-lg leading-relaxed">
					We get it — chasing DMs, unclear project details, and ghosting kills the vibe. Zenny was built to fix that.
					Whether you're an editor seeking real gigs or a creator needing quality edits — Zenny brings both together,
					drama-free.
				</p>

				<p className="text-base sm:text-lg leading-relaxed">
					Our mission? To simplify the connection between creators and editors — giving both the freedom to focus on
					what they do best, without the hassle.
				</p>
			</div>

			{/* Image */}
			<div className="md:w-1/2 flex justify-center">
				<img
					src={aboutImg}
					alt="About Zenny"
					className="w-full max-w-md rounded-2xl shadow-xl hover:scale-105 transition duration-300 ease-in-out"
				/>
			</div>
		</div>
	);
};

export default AboutIntro;
