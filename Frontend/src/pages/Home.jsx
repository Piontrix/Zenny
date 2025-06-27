import WhyZenny from "../components/About/WhyZenny";
import FAQSection from "../components/Home/FAQSection";
import HeroFormSection from "../components/Home/HeroFormSection";
import OurMission from "../components/Home/OurMission";

const Home = () => {
	return (
		<>
			<HeroFormSection />
			<WhyZenny />
			<OurMission />
			<FAQSection />
		</>
	);
};

export default Home;
