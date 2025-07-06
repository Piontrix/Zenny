import ImageWithLoader from "../common/ImageWithLoader";
import founderImg from "../../assets/aboutUsZenny.jpg"; // Make sure this path is correct

const AboutFounder = () => {
	return (
		<div className="bg-[#fadacb] py-20">
			<div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-start">
				{/* Founder Image */}
				<div className="relative z-0">
					<div className="rounded-xl overflow-hidden shadow-xl w-[300px] sm:w-[400px] lg:w-[450px]">
						<ImageWithLoader
							src={founderImg}
							alt="Zenny Co-Founder"
							className="w-full h-auto object-cover rounded-xl"
						/>
					</div>
				</div>

				{/* Floating Bio Card */}
				<div className="relative z-10 lg:-ml-16 mt-8 lg:mt-0">
					<div className="bg-[#fff8f7] border border-[#d76767] rounded-xl shadow-lg px-6 sm:px-8 py-6 sm:py-8 max-w-4xl text-roseclub-dark">
						<h2 className="text-2xl sm:text-3xl font-romantic font-bold text-roseclub-medium mb-4">
							About the Founder 👩🏻‍💼
						</h2>

						<p className="text-base sm:text-lg leading-relaxed">
							<strong>Zenny</strong> was built by <strong>Riddhi Aggarwal</strong> — a young, ambitious founder who
							believes in keeping things real, unfiltered, and efficient. At just 19, Riddhi decided to solve a problem
							most creators silently struggle with — finding reliable, affordable editors without all the hassle.
						</p>

						<p className="text-base sm:text-lg leading-relaxed mt-4">
							With a background rooted in business and creativity, and after experiencing firsthand how messy the
							creator economy can get, she set out to build a solution that’s simple, trustworthy, and creator-friendly.
						</p>

						<p className="text-base sm:text-lg leading-relaxed mt-4">
							Zenny isn’t just a platform — it’s a reflection of her belief that great work should be easy to access, no
							matter who you are.
						</p>

						<p className="text-base sm:text-lg italic leading-relaxed mt-4">
							Driven by the same chaos, caffeine, and late-night overthinking every founder knows, Riddhi’s journey is
							proof that you don’t need to have it all figured out — you just need to start.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AboutFounder;
