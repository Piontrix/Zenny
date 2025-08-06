import { useState } from "react";

const PhoneNumberModal = ({ onClose, onSubmit }) => {
	const [phone, setPhone] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!/^[6-9]\d{9}$/.test(phone)) {
			alert("Please enter a valid 10-digit Indian phone number.");
			return;
		}
		onSubmit(phone);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
			<div className="bg-white p-6 rounded-lg max-w-sm w-full">
				<h2 className="text-lg font-bold mb-4">Enter Phone Number</h2>
				<p className="text-sm text-gray-500 mb-2">
					This is required by our payment provider (Cashfree). We do not store it.
				</p>
				<form onSubmit={handleSubmit}>
					<input
						type="tel"
						placeholder="Enter 10-digit phone number"
						className="w-full border px-3 py-2 rounded mb-4"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						required
					/>
					<div className="flex justify-end gap-2">
						<button type="button" onClick={onClose} className="text-gray-600 px-4 py-2">
							Cancel
						</button>
						<button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
							Proceed
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default PhoneNumberModal;
