import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import ScrollToTop from "./components/ScrollToTop";
import FAQSection from "./components/Home/FAQSection";
import ZennyPerks from "./pages/ZennyPerks";

const App = () => {
	return (
		<Router>
			<Layout>
				<ScrollToTop />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/portfolio" element={<Portfolio />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/faqs" element={<FAQSection />} />
					<Route path="/zenny-perks" element={<ZennyPerks />} />
					<Route path="*" element={<PageNotFound />} />
				</Routes>
			</Layout>
		</Router>
	);
};

export default App;
