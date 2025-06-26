const Footer = () => {
	return (
		<footer className="bg-roseclub-paper text-roseclub-medium py-8  border-t border-roseclub-light text-center font-romantic">
			<p className="text-sm sm:text-base">
				&copy; {new Date().getFullYear()} <span className="font-semibold text-roseclub-accent">Zenny</span>. All rights
				reserved.
			</p>
			<p className="text-xs text-roseclub-dark mt-1 italic">Crafted with love & creativity 💌</p>
		</footer>
	);
};

export default Footer;
