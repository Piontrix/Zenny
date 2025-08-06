import React from "react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import SocialMediaSection from "../components/ZennyPerks/SocialMediaSection";

const ZennyPerks = () => {
	return (
		<div className="min-h-screen w-full">
			{/* 💡 Combined Hero + Intro Section */}
			<section className="bg-[#fadacb] text-roseclub-dark py-20 px-6 sm:px-10 text-center">
				<div className="max-w-4xl mx-auto space-y-6">
					<h1 className="text-3xl sm:text-5xl font-bold font-romantic leading-snug">
						Zenny isn’t an agency, and that’s the whole point.
					</h1>
					<p className="text-lg sm:text-xl leading-relaxed">
						But for select projects, we do handle your entire social media, from <strong>filming</strong> to{" "}
						<strong>editing</strong> to <strong>posting</strong>. Everything, done for you.
					</p>
					<p className="text-lg sm:text-xl leading-relaxed">
						If you’re curious how that works, just drop us a message. We’ll walk you through it.
					</p>
				</div>
			</section>

			<SocialMediaSection />

			{/* 💬 Final CTA */}
			<section className="bg-[#fadacb] text-roseclub-dark py-20 px-6 sm:px-10 text-center">
				<div className="max-w-2xl mx-auto">
					<h2 className="text-2xl sm:text-3xl font-bold font-romantic mb-6">Let’s Make Something Awesome</h2>
					<p className="text-lg sm:text-xl leading-relaxed mb-8">
						Whether you're ready to roll or just exploring, drop us a message and we’ll take it from there.
					</p>

					<a
						href="https://wa.me/919999999999"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-3 bg-roseclub-accent hover:bg-roseclub-dark text-white text-lg font-semibold px-6 py-3 rounded-full transition duration-300 shadow-md"
					>
						<FaWhatsapp className="text-xl" />
						Chat Now
					</a>
				</div>
			</section>
		</div>
	);
};

export default ZennyPerks;
