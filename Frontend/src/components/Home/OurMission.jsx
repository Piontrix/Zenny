import React from "react";
import { PiTargetBold } from "react-icons/pi";

const OurMission = () => {
	return (
		<section className="mt-24 px-6">
			<div className="max-w-5xl mx-auto text-center pb-20">
				<div className="flex flex-col items-center justify-center mb-6">
					<div className="w-12 h-12 flex items-center justify-center bg-roseclub-accent/10 rounded-full mb-2">
						<PiTargetBold className="text-2xl text-roseclub-accent" />
					</div>
					<h2 className="text-4xl sm:text-5xl font-romantic text-roseclub-accent drop-shadow-sm">Our Mission 🎯</h2>
				</div>

				<p className="text-base sm:text-lg text-roseclub-medium leading-relaxed">
					At <span className="font-semibold text-roseclub-dark">Zenny</span>, our mission is simple:
					<br className="hidden sm:block" />
					to make collaboration between content creators and editors{" "}
					<span className="italic font-medium text-roseclub-dark">effortless, secure, and genuinely rewarding</span>.
				</p>

				<p className="mt-4 text-base sm:text-lg text-roseclub-medium leading-relaxed">
					We believe in **letting work shine** — not followers or filters. That’s why we built a space where creative
					minds connect anonymously, share clear project expectations, and create magic without drama or distractions.
				</p>

				<p className="mt-6 text-roseclub-dark font-semibold text-lg">
					Zenny is where talent meets zero-stress collaboration. Let’s build better content, together. ✨
				</p>
			</div>
		</section>
	);
};

export default OurMission;
