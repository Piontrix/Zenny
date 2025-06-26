import { useState } from "react";
import HeroMainText from "./HeroMainText";
import HeroFormModal from "./HeroFormModal";

const HeroFormSection = () => {
	const [role, setRole] = useState("Editor");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		followerCount: "",
	});
	const [showModal, setShowModal] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("🚀 Submitted Form Data:", { ...formData, role });

		// Reset form
		setFormData({ name: "", email: "", phone: "", followerCount: "" });
		setRole("Editor");
		setShowModal(false);
	};

	return (
		<section className="relative min-h-screen flex items-center justify-center px-6 md:px-20 py-20 bg-roseclub-light overflow-hidden font-romantic">
			{/* Pattern Icons Layer */}
			{/* <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
				<img src="/homeSvgs/video.svg" alt="Video" className="absolute top-12 left-20 w-20 rotate-12 " />

				<img src="/homeSvgs/crown.svg" alt="Crown" className="absolute top-1/2 right-56 w-20 rotate-12 " />

				<img
					src="/homeSvgs/videoPlayer.svg"
					alt="Video player"
					className="absolute bottom-32 right-16 w-20 rotate-6 "
				/>

				<img src="/homeSvgs/eye.svg" alt="eye" className="absolute top-1/3 right-20 w-20 -rotate-3 " />

				<img src="/homeSvgs/heart.svg" alt="heart" className="absolute top-10 right-32 w-20 rotate-12 " />

				<img src="/homeSvgs/love.svg" alt="love" className="absolute top-1/2 left-28 w-20 -rotate-45 " />

				<img src="../../homeSvgs/book.svg" alt="book" className="absolute top-20 left-1/2 w-20 animate-spin-slow" />

				<img src="../../homeSvgs/time.svg" alt="time" className="absolute top-16 left-2/3 w-20 animate-spin-slow" />

				<img src="../../homeSvgs/dice.svg" alt="dice" className="absolute bottom-20 left-1/3 w-20 animate-spin-slow" />

				<img
					src="../../homeSvgs/eiffelTower.svg"
					alt="Eiffel Tower"
					className="absolute bottom-28 right-1/3 w-20 animate-spin-slow"
				/>

				<img
					src="../../homeSvgs/heartKey.svg"
					alt="Heart Key"
					className="absolute top-20 left-1/3 w-20 animate-spin-slow"
				/>

				<img
					src="../../homeSvgs/heartArrow.svg"
					alt="Heart Arrow"
					className="absolute bottom-24 left-40 w-20 animate-spin-slow"
				/>
			</div> */}

			{/* Background Blobs (you already have this) */}
			<div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-roseclub-accent rounded-full blur-3xl opacity-30 hidden md:block z-0 animate-pulse"></div>
			<div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[450px] bg-roseclub-dark rounded-full blur-2xl md:opacity-40 opacity-0 animate-bounce z-0"></div>

			<HeroMainText onOpenModal={() => setShowModal(true)} />

			<HeroFormModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				formData={formData}
				setFormData={setFormData}
				role={role}
				setRole={setRole}
				onSubmit={handleSubmit}
			/>
		</section>
	);
};

export default HeroFormSection;
