import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const { user, logout } = useAuth();

	const navLinks = [
		{ label: "Home", to: "/" },
		{ label: "Portfolio", to: "/portfolio" },
		{ label: "About Us", to: "/about" },
		{ label: "Contact Us", to: "/contact" },
		{ label: "Zenny Perks", to: "/zenny-perks" },
	];

	const activeLinkClass = "text-roseclub-accent font-extrabold";

	const isCreatorOrEditor = user?.role === "creator" || user?.role === "editor";
	const isAdmin = user?.role === "admin";

	return (
		<nav className="sticky top-0 z-50 bg-roseclub-paper/70 backdrop-blur-md shadow-md font-serif">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link to="/" className="flex items-center space-x-2">
						<span className="text-3xl font-extrabold text-roseclub-dark tracking-wide">Zenny</span>
						<img src="/navbarImage.png" alt="Zenny Logo" className="h-10 w-auto object-contain" />
					</Link>

					{/* Desktop Nav */}
					<div className="hidden md:flex space-x-8 lg:text-xl text-roseclub-medium font-medium">
						{navLinks.map((link) => (
							<NavLink
								key={link.to}
								to={link.to}
								className={({ isActive }) => `hover:text-roseclub-accent transition ${isActive ? activeLinkClass : ""}`}
							>
								{link.label}
							</NavLink>
						))}
					</div>

					{/* Right Section Desktop */}
					<div className="hidden md:flex items-center space-x-4">
						{user ? (
							<>
								{/* Chat button for creator/editor */}
								{isCreatorOrEditor && (
									<Link to="/chat">
										<button className="px-4 py-2 text-xl bg-roseclub-accent text-white rounded-full hover:bg-roseclub-dark transition font-semibold shadow-md">
											Chat
										</button>
									</Link>
								)}

								{/* Profile icon */}
								{(isCreatorOrEditor || isAdmin) && (
									<Link
										to={isAdmin ? "/admin/dashboard" : "/profile"}
										className="text-2xl text-roseclub-accent hover:text-roseclub-dark transition"
										title="Profile"
									>
										<FaUserCircle />
									</Link>
								)}

								{/* Logout */}
								<button
									onClick={logout}
									className="px-4 py-2 text-xl bg-roseclub-dark text-white rounded-full hover:bg-roseclub-medium transition font-semibold shadow"
								>
									Logout
								</button>
							</>
						) : (
							<>
								{/* Login & Register buttons */}
								<Link to="/login">
									<button className="px-4 py-2 text-xl bg-roseclub-accent text-white rounded-full hover:bg-roseclub-dark transition font-semibold shadow-md">
										Login
									</button>
								</Link>
								<Link to="/register">
									<button className="px-4 py-2 text-xl bg-roseclub-accent text-white rounded-full hover:bg-roseclub-dark transition font-semibold shadow-md">
										Register
									</button>
								</Link>
							</>
						)}
					</div>

					{/* Hamburger Button */}
					<div className="md:hidden">
						<button onClick={() => setMenuOpen(!menuOpen)} className="relative w-8 h-8 focus:outline-none group">
							<span
								className={`block absolute h-0.5 w-8 bg-roseclub-dark transform transition duration-300 ease-in-out ${
									menuOpen ? "rotate-45 top-3.5" : "top-1"
								}`}
							/>
							<span
								className={`block absolute h-0.5 w-8 bg-roseclub-dark transform transition duration-300 ease-in-out ${
									menuOpen ? "opacity-0" : "top-3.5"
								}`}
							/>
							<span
								className={`block absolute h-0.5 w-8 bg-roseclub-dark transform transition duration-300 ease-in-out ${
									menuOpen ? "-rotate-45 top-3.5" : "top-6"
								}`}
							/>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Nav */}
			<div
				className={`text-center md:hidden px-4 transition-all duration-300 ease-in-out overflow-hidden bg-roseclub-light ${
					menuOpen ? " pt-4 pb-6 opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"
				}`}
			>
				<div className="space-y-3">
					{navLinks.map((link) => (
						<NavLink
							key={link.to}
							to={link.to}
							onClick={() => setMenuOpen(false)}
							className={({ isActive }) =>
								`block px-4 py-2 rounded-md text-roseclub-dark hover:text-roseclub-accent hover:bg-roseclub-paper transition text-xl font-medium ${
									isActive ? activeLinkClass + " bg-roseclub-paper" : ""
								}`
							}
						>
							{link.label}
						</NavLink>
					))}

					{user ? (
						<>
							{/* Chat button for creator/editor */}
							{isCreatorOrEditor && (
								<Link to="/chat" onClick={() => setMenuOpen(false)}>
									<button className="w-full bg-roseclub-accent text-white py-2 rounded-full hover:bg-roseclub-dark transition mb-2">
										Chat
									</button>
								</Link>
							)}

							{/* Profile icon */}
							{(isCreatorOrEditor || isAdmin) && (
								<Link
									to={isAdmin ? "/admin/dashboard" : "/profile"}
									onClick={() => setMenuOpen(false)}
									className="inline-block text-3xl text-roseclub-accent hover:text-roseclub-dark transition"
									title="Profile"
								>
									<FaUserCircle />
								</Link>
							)}

							{/* Logout */}
							<button
								onClick={() => {
									logout();
									setMenuOpen(false);
								}}
								className="w-full bg-roseclub-dark text-white py-2 rounded-full hover:bg-roseclub-medium transition"
							>
								Logout
							</button>
						</>
					) : (
						<>
							<Link to="/login" onClick={() => setMenuOpen(false)}>
								<button className="w-full bg-roseclub-accent text-white py-2 rounded-full hover:bg-roseclub-dark transition mb-2">
									Login
								</button>
							</Link>
							<Link to="/register" onClick={() => setMenuOpen(false)}>
								<button className="w-full bg-roseclub-accent text-white py-2 rounded-full hover:bg-roseclub-dark transition mb-2">
									Register
								</button>
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
