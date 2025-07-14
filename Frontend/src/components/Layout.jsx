import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
	const location = useLocation();

	// List of routes where Footer should NOT be shown
	const hideFooterRoutes = [
		"/admin/dashboard",
		"/admin/chat-rooms",
		"/admin/chat-rooms/:roomId",
		"/admin/register-editor",
	];

	const shouldHideFooter = hideFooterRoutes.some((path) => location.pathname.startsWith(path.replace(":roomId", "")));

	return (
		<div className="flex flex-col min-h-screen bg-roseclub-paper">
			<Navbar />
			<main className="flex-grow">{children}</main>
			{!shouldHideFooter && <Footer />}
		</div>
	);
};

export default Layout;
