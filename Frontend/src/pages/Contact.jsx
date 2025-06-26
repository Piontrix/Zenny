import ContactForm from "../components/Contact/ContactForm";
import ContactHeader from "../components/Contact/ContactHeader";
import WhyReachOut from "../components/Contact/WhyReachOut";

const Contact = () => {
	return (
		<section className="bg-roseclub-paper text-roseclub-dark min-h-screen pt-16 pb-24 px-6 sm:px-10">
			<div className="max-w-5xl mx-auto space-y-12">
				<ContactHeader />
				<div className="grid md:grid-cols-2 gap-12">
					<WhyReachOut />
					<ContactForm />
				</div>
			</div>
		</section>
	);
};

export default Contact;
