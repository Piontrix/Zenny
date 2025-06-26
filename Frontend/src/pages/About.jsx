import React from "react";
import aboutImg from "../assets/aboutUsZenny.jpg"; // Adjust path
import ValueCard from "../components/About/ValueCard";
const coreValues = [
	{
		title: "Authentic Collaboration",
		description: "Zenny bridges creators and editors through real work — no clout, no filters, just vibes and results.",
	},
	{
		title: "Anonymity by Design",
		description:
			"Connect without bias. Editors and creators work anonymously, letting the work — not the face — speak.",
	},
	{
		title: "Creative Freedom",
		description: "We empower bold editing styles, quirky scripts, viral formats, and unconventional storytelling.",
	},
	{
		title: "Mutual Growth",
		description: "Creators get quality edits, editors get recognition (and gigs) — Zenny grows with every collab.",
	},
	{
		title: "Built for GenZ",
		description: "Our design, language, and vibe are tailor-made for GenZ creatives who want fun + function.",
	},
	{
		title: "Safety & Clarity",
		description: "No ghosting, no shady deals. Clear briefs, defined deadlines, and respectful communication always.",
	},
];

const About = () => {
	return (
		<section className="bg-roseclub-paper text-roseclub-dark min-h-screen pt-16 pb-20 px-6 sm:px-10">
			{/* Intro Section */}
			<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
				{/* Text Content */}
				<div className="md:w-1/2 space-y-6 text-center md:text-left">
					<h1 className="text-4xl sm:text-5xl font-romantic text-roseclub-accent drop-shadow-sm">
						About <span className="text-roseclub-medium">Zenny</span>
					</h1>

					<p className="text-base sm:text-lg leading-relaxed">
						Zenny isn’t just a platform — it’s a vibe. Crafted for GenZ creators & editors, we turn collabs into magic.
						Whether you're an aesthetic editor, reel specialist, storyteller, or trendmaker — Zenny’s built for you.
					</p>

					<p className="text-base sm:text-lg leading-relaxed">
						We keep it anonymous, real, and efficient. No clout chasing. No awkward DMs. Just meaningful work —
						delivered with style.
					</p>

					<p className="text-base sm:text-lg leading-relaxed">
						Our mission? To empower new-gen creators by making collaboration fun, safe, and actually rewarding. Zero
						drama. Maximum impact.
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

			{/* Our Values Section */}
			<div className="max-w-7xl mx-auto mt-20">
				<h2 className="text-3xl sm:text-4xl text-center font-romantic text-roseclub-accent mb-10">
					Our Core Values 💫
				</h2>

				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{coreValues.map((value) => (
						<ValueCard key={value.title} title={value.title} description={value.description} />
					))}
				</div>
			</div>

			{/* CTA */}
			<div className="mt-20 text-center">
				<p className="text-roseclub-dark text-lg sm:text-xl font-medium">
					Let’s redefine collaboration. Let’s create Zenny magic. 💖
				</p>
			</div>
		</section>
	);
};

export default About;
