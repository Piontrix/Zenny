const ValueCard = ({ title, description }) => {
	return (
		<div className="p-6 bg-white/60 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg transition text-center">
			<h3 className="text-xl font-semibold text-roseclub-dark mb-2">{title}</h3>
			<p className="text-sm text-roseclub-medium">{description}</p>
		</div>
	);
};

export default ValueCard;
