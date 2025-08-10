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
		// console.log("🚀 Submitted Form Data:", { ...formData, role });

		// Reset form
		setFormData({ name: "", email: "", phone: "", followerCount: "" });
		setRole("Editor");
		setShowModal(false);
	};

	return (
		<section
			className="relative min-h-[70vh] flex items-center justify-center px-6 md:px-20 py-20 bg-cover bg-center bg-no-repeat font-serif overflow-hidden"
			style={{
				backgroundImage: `url('/heroHomeBG.png')`,
				height: "80vh",
			}}
		>
			{/* Blobs for aesthetic */}
			<div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-roseclub-accent rounded-full blur-3xl opacity-30 hidden md:block z-0 animate-pulse"></div>
			<div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[450px] bg-roseclub-dark rounded-full blur-2xl md:opacity-40 opacity-0 animate-bounce z-0"></div>

			{/* Main Text & Modal */}
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
