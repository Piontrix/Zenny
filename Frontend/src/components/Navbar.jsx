import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

const Navbar = ({ isLoggedIn = false }) => {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<div className="flex-shrink-0 text-2xl font-bold text-pink-600">Zenny</div>

					{/* Desktop Nav */}
					<div className="hidden md:flex space-x-8 text-gray-700 font-medium">
						<a href="#" className="hover:text-pink-600 transition">
							Home
						</a>
						<a href="#" className="hover:text-pink-600 transition">
							Portfolio
						</a>
						<a href="#" className="hover:text-pink-600 transition">
							About Us
						</a>
						<a href="#" className="hover:text-pink-600 transition">
							Contact Us
						</a>
					</div>

					{/* Right Section */}
					<div className="hidden md:flex items-center space-x-4">
						{isLoggedIn ? (
							<FaUserCircle className="text-2xl text-pink-600 cursor-pointer" />
						) : (
							<button className="px-4 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition">
								Login
							</button>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden">
						<button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-700 focus:outline-none">
							☰
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Nav */}
			{menuOpen && (
				<div className="md:hidden px-4 pb-4 space-y-2">
					<a href="#" className="block text-gray-700 hover:text-pink-600">
						Home
					</a>
					<a href="#" className="block text-gray-700 hover:text-pink-600">
						Portfolio
					</a>
					<a href="#" className="block text-gray-700 hover:text-pink-600">
						About Us
					</a>
					<a href="#" className="block text-gray-700 hover:text-pink-600">
						Contact Us
					</a>
					{isLoggedIn ? (
						<FaUserCircle className="text-2xl text-pink-600 mt-2" />
					) : (
						<button className="w-full bg-pink-600 text-white py-2 rounded-full hover:bg-pink-700 transition">
							Login
						</button>
					)}
				</div>
			)}
		</nav>
	);
};

export default Navbar;
