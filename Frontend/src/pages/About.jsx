import React from "react";
import AboutIntro from "../components/About/AboutIntro";
import AboutFounder from "../components/About/AboutFounder";
import CoreValuesSection from "../components/About/CoreValuesSection";

const About = () => {
	return (
		<div className="min-h-screen w-full">
			<section className="bg-[#d87376] text-white py-16 px-6 sm:px-10">
				<AboutIntro />
			</section>

			<section className="bg-[#fadacb] text-roseclub-dark py-20 px-6 sm:px-10">
				<AboutFounder />
			</section>

			<section className="bg-[#731a17] text-white py-20 px-6 sm:px-10">
				<CoreValuesSection />
			</section>
		</div>
	);
};

export default About;
