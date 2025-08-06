import React from "react";
import ValueCard from "./ValueCard";

const coreValues = [
	{
		title: "Authentic Collaboration",
		description: "Zenny bridges creators and editors through real work, no clout, no filters, just vibes and results.",
	},
	{
		title: "Anonymity by Design",
		description: "Connect without bias. Editors and creators work anonymously, letting the work, not the face, speak.",
	},
	{
		title: "Creative Freedom",
		description: "We empower bold editing styles, quirky scripts, viral formats, and unconventional storytelling.",
	},
	{
		title: "Mutual Growth",
		description: "Creators get quality edits, editors get recognition (and gigs), Zenny grows with every collab.",
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

const CoreValues = () => {
	return (
		<div className="text-white">
			<h2 className="text-3xl sm:text-4xl text-center font-romantic text-white mb-10">Our Core Values 💫</h2>
			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{coreValues.map((value) => (
					<ValueCard
						key={value.title}
						title={value.title}
						description={value.description}
						dark={true} // Pass this if you're styling card components differently for dark backgrounds
					/>
				))}
			</div>
		</div>
	);
};

export default CoreValues;
