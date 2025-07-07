import React from "react";
import { FaInstagram } from "react-icons/fa";
import ValueCard from "../About/ValueCard"; // Make sure this path is correct

const creators = [
	{
		name: "Creator 1",
		handle: "@creator_one",
		type: "Lifestyle Vlogs",
		quote: "Love working with the Zenny team!",
		link: "https://www.instagram.com/creator_one",
	},
	{
		name: "Creator 2",
		handle: "@creator_two",
		type: "Comedy Reels",
		quote: "Zenny made my edits stress-free.",
		link: "https://www.instagram.com/creator_two",
	},
	{
		name: "Creator 3",
		handle: "@creator_three",
		type: "Podcast Clips",
		quote: "Super fast turnaround. Loved it!",
		link: "https://www.instagram.com/creator_three",
	},
	{
		name: "Creator 4",
		handle: "@creator_four",
		type: "Fashion Creator",
		quote: "My go-to for all video edits",
		link: "https://www.instagram.com/creator_four",
	},
];

const SocialMediaSection = () => {
	return (
		<section className="bg-roseclub-dark text-white py-20 px-6 sm:px-10">
			<div className="max-w-6xl mx-auto text-center">
				<h2 className="text-3xl sm:text-4xl font-semibold font-romantic mb-12">We’ve Edited For These Creators ✂️</h2>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
					{creators.map((creator, idx) => (
						<a
							key={idx}
							href={creator.link}
							target="_blank"
							rel="noopener noreferrer"
							className="transition-transform hover:scale-[1.02]"
						>
							<ValueCard
								dark={true}
								title={
									<div className="flex items-center gap-2">
										<FaInstagram className="text-pink-400" />
										<span className="font-bold">{creator.name}</span>
									</div>
								}
								description={
									<>
										<div className="text-white/90">{creator.handle}</div>
										<div className="italic text-white/70 text-sm mt-1">{creator.type}</div>
										{creator.quote && <p className="italic text-white/70 mt-4">“{creator.quote}”</p>}
									</>
								}
							/>
						</a>
					))}
				</div>
			</div>
		</section>
	);
};

export default SocialMediaSection;
