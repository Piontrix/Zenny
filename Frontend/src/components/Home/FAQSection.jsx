import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const faqs = [
	{
		question: "What is Zenny?",
		answer:
			"Zenny is the easiest way to find the perfect video editor for your content. Browse verified portfolios, connect directly, and get your videos edited, no stress.",
	},
	{
		question: "How does Zenny work?",
		answer: `Simple.
→ Search through editor profiles and portfolios.
→ Connect with any editor you like via our chat.
→ Get a watermarked sample of your edit.
→ Once you’re happy, make the payment via a secure link.
→ Receive the final, un-watermarked video.`,
	},
	{
		question: "Can I message multiple editors?",
		answer: "Yes, you’re free to connect with as many editors as you like, find the one that fits your style.",
	},
	{
		question: "Is it really anonymous?",
		answer: "Yes. All chats happen using unique IDs, no need to share personal contact details.",
	},
	{
		question: "How do payments work?",
		answer:
			"The editor sends a payment link after your watermarked sample is approved. Once payment is complete, your final video is delivered.",
	},
	{
		question: "Do I have to pay if I don’t like the sample?",
		answer: "Nope. Payment only happens after you approve the watermarked sample.",
	},
	{
		question: "How much does it cost?",
		answer:
			"Prices are set individually by editors, their rates are visible on their profiles, so there are no surprises.",
	},
	{
		question: "Can I work with the same editor again?",
		answer: "Definitely. Once you find your go-to editor, you can work with them again, all through Zenny.",
	},
	{
		question: "Who are the editors on Zenny?",
		answer:
			"All editors are verified by Zenny. You can view their portfolios, pricing, and past work before choosing to connect.",
	},
];

const FAQSection = () => {
	const [openIndex, setOpenIndex] = useState(null);

	const toggleFAQ = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className="bg-roseclub-dark py-20 px-6 sm:px-10 text-white">
			<div className="max-w-4xl mx-auto">
				<h2 className="text-3xl sm:text-4xl font-romantic font-bold mb-10 text-center text-roseclub-bg">
					Frequently Asked Questions 💬
				</h2>

				<div className="space-y-4">
					{faqs.map((faq, index) => {
						const isOpen = openIndex === index;
						return (
							<div
								key={index}
								className="rounded-xl border border-roseclub-light bg-white/5 backdrop-blur-sm transition-all duration-300 overflow-hidden"
							>
								<button
									onClick={() => toggleFAQ(index)}
									className="w-full flex justify-between items-center px-5 py-4 text-left text-lg font-semibold text-white"
								>
									<span>{faq.question}</span>
									<span className="text-roseclub-accent">{isOpen ? <FaMinus /> : <FaPlus />}</span>
								</button>

								<div
									className={`px-5 transform-gpu transition-all duration-300 ease-in-out origin-top ${
										isOpen ? "scale-y-100 max-h-screen py-3" : "scale-y-0 max-h-0 py-0"
									}`}
									style={{ transitionProperty: "transform, max-height, padding" }}
								>
									<p className="text-sm sm:text-base text-white/90 whitespace-pre-line leading-relaxed">{faq.answer}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default FAQSection;
