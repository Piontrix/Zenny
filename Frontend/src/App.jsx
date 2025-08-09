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
import VerifyOtp from "./pages/VerifyOtp";
import AdminChatView from "./pages/Admin/AdminChatView";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRegisterEditor from "./pages/Admin/AdminRegisterEditor";
import CreatorRegister from "./pages/CreatorRegister";
import AdminChatRooms from "./pages/Admin/AdminChatRooms";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import { Toaster } from "react-hot-toast";
import EditorPortfolioDetail from "./components/Portfolio/EditorPortfolioDetail";
import AdminEditEditorPortfolio from "./pages/AdminEditEditorPortfolio";
import AdminAllEditors from "./pages/Admin/AdminAllEditors";
import AdminEditEditorPortfolioStructure from "./pages/Admin/AdminEditEditorPortfolioStructure";
import AdminSupportTickets from "./pages/Admin/AdminSupportTickets";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminPayments from "./components/AdminPayments";

const App = () => {
	return (
		<Router>
			<Layout>
				<ScrollToTop />
				<Toaster
					position="top-right"
					toastOptions={{
						duration: 3000,
						style: {
							background: "#fff8f7", // roseclub.paper
							color: "#9e2a2b", // roseclub.dark
							border: "1px solid #f4b6b6", // roseclub.light
							fontFamily: "Inter, sans-serif",
						},
						success: {
							iconTheme: {
								primary: "#e63946", // roseclub.accent
								secondary: "#fff",
							},
						},
						error: {
							iconTheme: {
								primary: "#d76767", // roseclub.medium
								secondary: "#fff",
							},
						},
					}}
				/>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/portfolio" element={<Portfolio />} />
					<Route path="/portfolio/:editorId" element={<EditorPortfolioDetail />} />
					<Route
						path="/profile"
						element={
							<ProtectedRoute allowedRoles={["creator", "editor"]}>
								<Profile />
							</ProtectedRoute>
						}
					/>

					<Route path="/faqs" element={<FAQSection />} />
					<Route path="/zenny-perks" element={<ZennyPerks />} />
					<Route path="/login" element={<CreatorLogin />} />
					<Route path="/editor-login" element={<EditorLogin />} />
					<Route path="/admin-login" element={<AdminLogin />} />
					<Route path="/verify-otp" element={<VerifyOtp />} />
					<Route path="/register" element={<CreatorRegister />} />
					<Route path="/payment-success" element={<PaymentSuccess />} />
					<Route
						path="/chat"
						element={
							<ProtectedRoute allowedRoles={["creator", "editor"]}>
								<ChatPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/admin/dashboard"
						element={
							<ProtectedRoute allowedRoles={["admin"]}>
								<AdminDashboard />
							</ProtectedRoute>
						}
					>
						<Route path="register-editor" element={<AdminRegisterEditor />} />
						<Route path="chat-rooms" element={<AdminChatRooms />} />
						<Route path="chat-rooms/:roomId" element={<AdminChatView />} />
						<Route path="all-editors" element={<AdminAllEditors />} />
						<Route path="edit-editor/:editorId" element={<AdminEditEditorPortfolio />} />
						<Route path="/admin/dashboard/edit-structure/:editorId" element={<AdminEditEditorPortfolioStructure />} />
						<Route path="/admin/dashboard/all-payments" element={<AdminPayments />} />
						<Route path="/admin/dashboard/support-tickets" element={<AdminSupportTickets />} />
					</Route>

					<Route path="*" element={<PageNotFound />} />
				</Routes>
			</Layout>
		</Router>
	);
};

export default App;
