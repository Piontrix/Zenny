import React, { useState } from "react";

const ProfileMenu = ({ onSelect }) => {
	const [active, setActive] = useState("paymentHistory");

	const handleSelect = (key) => {
		setActive(key);
		onSelect(key);
	};

	return (
		<div className="w-48 bg-white shadow rounded-lg p-4">
			<h2 className="font-semibold text-lg mb-4">Profile Menu</h2>
			<ul className="flex flex-col space-y-2">
				<li>
					<button
						className={`w-full text-left px-3 py-2 rounded ${
							active === "paymentHistory" ? "bg-roseclub-accent text-white font-semibold" : "hover:bg-roseclub-light"
						}`}
						onClick={() => handleSelect("paymentHistory")}
					>
						Payment History
					</button>
				</li>
				{/* Add more menu items here */}
			</ul>
		</div>
	);
};

export default ProfileMenu;
