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
import ChatPage from "./pages/ChatPage";
import CreatorLogin from "./pages/auth/CreatorLogin";
import EditorLogin from "./pages/auth/EditorLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import CreatorRegister from "./pages/CreatorRegister";
import VerifyOtp from "./pages/VerifyOtp";
import AdminChatRooms from "./pages/AdminChatRooms";
import AdminChatView from "./pages/AdminChatView";

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
					<Route path="/chat" element={<ChatPage />} />
					<Route path="*" element={<PageNotFound />} />
					<Route path="/login" element={<CreatorLogin />} />
					<Route path="/editor-login" element={<EditorLogin />} />
					<Route path="/admin-login" element={<AdminLogin />} />
					<Route path="/register" element={<CreatorRegister />} />
					<Route path="/verify-otp" element={<VerifyOtp />} />
					<Route path="/admin/chat-rooms" element={<AdminChatRooms />} />
					<Route path="/admin/chat-rooms/:roomId" element={<AdminChatView />} />
				</Routes>
			</Layout>
		</Router>
	);
};

export default App;
