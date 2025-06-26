import React from "react";
import AboutIntro from "../components/About/AboutIntro";
import CoreValues from "../components/About/CoreValues";
import WhyZenny from "../components/About/WhyZenny";

const About = () => {
	return (
		<section className="bg-roseclub-paper text-roseclub-dark min-h-screen pt-16 pb-20 px-6 sm:px-10">
			<div className="max-w-7xl mx-auto space-y-20">
				<AboutIntro />
				<CoreValues />
				<WhyZenny />
				<div className="text-center">
					<p className="text-roseclub-dark text-lg sm:text-xl font-medium">
						Let’s redefine collaboration. Let’s create Zenny magic. 💖
					</p>
					<p className="text-sm text-roseclub-medium mt-4 italic">
						We’re building a space where creative work flows effortlessly — because at Zenny, the process should feel as
						good as the final product. ✨
					</p>
				</div>
			</div>
		</section>
	);
};

export default About;
