import React from "react";
import { BsPersonCheckFill, BsIncognito, BsChatDotsFill, BsShieldLockFill } from "react-icons/bs";

const features = [
	{
		icon: <BsPersonCheckFill className="text-xl text-roseclub-accent" />,
		title: "Verified Editors You Can Trust",
		description:
			"We don’t do random. Editors on Zenny are vetted for quality and communication so you can collaborate with peace of mind.",
	},
	{
		icon: <BsIncognito className="text-xl text-roseclub-accent" />,
		title: "Complete Anonymity",
		description:
			"Skip the awkward intros. Zenny lets creators and editors connect without revealing their identity — only your work matters here.",
	},
	{
		icon: <BsChatDotsFill className="text-xl text-roseclub-accent" />,
		title: "Clear Project Flow",
		description:
			"From brief to final file, Zenny gives you a clean pipeline. No guesswork, no confusion — just smooth collaboration.",
	},
	{
		icon: <BsShieldLockFill className="text-xl text-roseclub-accent" />,
		title: "Safe & Drama-Free",
		description:
			"Work in a respectful, toxicity-free environment. No ghosting, no rude replies — just mutual professionalism.",
	},
];

const WhyZenny = () => {
	return (
		<section className="mt-24 px-6">
			<div className="text-center mb-14">
				<h2 className="text-4xl sm:text-5xl font-romantic text-roseclub-accent drop-shadow-sm">Why Zenny? 🚀</h2>
				<p className="mt-3 text-base sm:text-lg text-roseclub-medium max-w-2xl mx-auto">
					We built Zenny for the next-gen creatives who want real work, not messy inboxes. Here’s why creators and
					editors trust us:
				</p>
			</div>

			<div className="grid sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
				{features.map((item, idx) => (
					<div
						key={idx}
						className="p-6 bg-white/70 backdrop-blur-xl border border-roseclub-light rounded-2xl shadow-sm hover:shadow-md transition"
					>
						<div className="flex items-center gap-4 mb-3">
							<div className="w-10 h-10 flex items-center justify-center bg-roseclub-accent/10 rounded-full">
								{item.icon}
							</div>
							<h3 className="text-lg font-semibold text-roseclub-dark">{item.title}</h3>
						</div>
						<p className="text-sm text-roseclub-medium leading-relaxed">{item.description}</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default WhyZenny;
