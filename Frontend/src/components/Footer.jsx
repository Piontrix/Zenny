import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
	return (
		<footer className="bg-roseclub-paper text-roseclub-medium border-t border-roseclub-light pt-12 pb-6 font-sans">
			<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 text-sm sm:text-base text-center md:text-left">
				{/* Zenny */}
				<div>
					<h3 className="text-roseclub-accent font-extrabold text-lg font-romantic mb-3">Zenny</h3>

					{/* Full text only on md+ */}
					<p className="text-roseclub-dark text-sm leading-relaxed hidden md:block">
						Zenny is a cozy space for creators and editors to connect, collaborate, and craft beautiful content —
						anonymously, yet meaningfully.
					</p>

					{/* Short tagline on small screens */}
					<p className="text-roseclub-dark text-sm leading-relaxed md:hidden">
						Creator–Editor collabs, made easy and anonymous.
					</p>
				</div>

				{/* Quick Links */}
				<div>
					<h3 className="text-roseclub-accent text-lg font-romantic font-extrabold mb-3">Quick Links</h3>
					<ul className="space-y-2">
						<li>
							<Link to="/" className="hover:text-roseclub-accent transition">
								Home
							</Link>
						</li>
						<li>
							<Link to="/about" className="hover:text-roseclub-accent transition">
								About Us
							</Link>
						</li>
						<li>
							<Link to="/portfolio" className="hover:text-roseclub-accent transition">
								Portfolio
							</Link>
						</li>
						<li>
							<Link to="/contact" className="hover:text-roseclub-accent transition">
								Contact Us
							</Link>
						</li>
					</ul>
				</div>

				{/* Contact */}
				<div>
					<h3 className="text-roseclub-accent text-lg font-extrabold font-romantic mb-3">Contact</h3>
					<ul className="space-y-2">
						<li>
							<a href="mailto:riddhi@zenny.in" className="hover:text-roseclub-accent transition">
								riddhi@zenny.in
							</a>
						</li>
						{/* <li>
							<a href="tel:+919643084065" className="hover:text-roseclub-accent transition">
								+91 9643084065
							</a>
						</li> */}
					</ul>
				</div>

				{/* Social Media */}
				<div>
					<h3 className="text-roseclub-accent text-lg font-extrabold font-romantic mb-3">Social Media</h3>
					<div className="flex space-x-4 mt-2 justify-center md:justify-start">
						<a
							href="https://www.instagram.com/getzenny_/"
							target="_blank"
							rel="noreferrer"
							className="text-roseclub-dark hover:text-roseclub-accent transition text-xl"
						>
							<FaInstagram />
						</a>
						<a
							href="https://www.youtube.com/@getzennyy"
							target="_blank"
							rel="noreferrer"
							className="text-roseclub-dark hover:text-roseclub-accent transition text-xl"
						>
							<FaYoutube />
						</a>
					</div>
				</div>
			</div>

			{/* Bottom Bar */}
			<div className="border-t border-roseclub-light mt-10 pt-4 text-center text-xs sm:text-sm text-roseclub-medium">
				<div className="flex flex-wrap justify-center gap-6 mb-2">
					<Link to="/terms" className="hover:text-roseclub-accent transition">
						Terms & Conditions
					</Link>
					<Link to="/faqs" className="hover:text-roseclub-accent transition">
						FAQs
					</Link>
					{/* <Link to="/refund-policy" className="hover:text-roseclub-accent transition">
						Refund Policy
					</Link> */}
				</div>

				<p className="mt-2 text-roseclub-dark italic font-romantic">
					&copy; {new Date().getFullYear()} <span className="text-roseclub-accent font-semibold">Zenny</span> — Crafted
					with love 💌
				</p>
			</div>
		</footer>
	);
};

export default Footer;
