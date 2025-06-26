import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";

const Navbar = ({ isLoggedIn = false }) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const navLinks = [
		{ label: "Home", to: "/" },
		{ label: "Portfolio", to: "/portfolio" },
		{ label: "About Us", to: "/about" },
		{ label: "Contact Us", to: "/contact" },
	];

	const activeLinkClass = "text-roseclub-accent font-semibold";

	return (
		<nav className="sticky top-0 z-50 bg-roseclub-paper/70 backdrop-blur-md shadow-md font-romantic">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link to="/" className="text-3xl font-extrabold text-roseclub-dark tracking-wide">
						Zenny
					</Link>

					{/* Desktop Nav */}
					<div className="hidden md:flex space-x-8 text-roseclub-medium font-medium">
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

					{/* Right Section */}
					<div className="hidden md:flex items-center space-x-4">
						{isLoggedIn ? (
							<Link to="/profile">
								<FaUserCircle className="text-2xl text-roseclub-accent cursor-pointer" />
							</Link>
						) : (
							<Link to="/login">
								<button className="px-4 py-2 bg-roseclub-accent text-white rounded-full hover:bg-roseclub-dark transition font-semibold shadow-md">
									Login
								</button>
							</Link>
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
					menuOpen ? "max-h-96 pt-4 pb-6 opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"
				}`}
			>
				<div className="space-y-3">
					{navLinks.map((link) => (
						<NavLink
							key={link.to}
							to={link.to}
							onClick={() => setMenuOpen(false)}
							className={({ isActive }) =>
								`block px-4 py-2 rounded-md text-roseclub-dark hover:text-roseclub-accent hover:bg-roseclub-paper transition text-base font-medium ${
									isActive ? activeLinkClass + " bg-roseclub-paper" : ""
								}`
							}
						>
							{link.label}
						</NavLink>
					))}

					{isLoggedIn ? (
						<Link to="/profile" onClick={() => setMenuOpen(false)}>
							<FaUserCircle className="text-2xl text-roseclub-accent mt-2" />
						</Link>
					) : (
						<Link to="/login" onClick={() => setMenuOpen(false)}>
							<button className="w-full bg-roseclub-accent text-white py-2 rounded-full hover:bg-roseclub-dark transition mt-2">
								Login
							</button>
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
