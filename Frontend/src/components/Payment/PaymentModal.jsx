import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axios";
import API from "../../constants/api";
import toast from "react-hot-toast";
import LoaderSpinner from "../common/LoaderSpinner";
import { launchCashfreeCheckout, isCashfreeAvailable } from "../../utils/cashfree";

const PaymentModal = ({ isOpen, onClose, editor, plan, amount }) => {
	const { user } = useAuth();
	const [formData, setFormData] = useState({
		phone: "",
		creatorNote: "",
	});
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!user || user.role !== "creator") {
			toast.error("Only creators can make payments");
			return;
		}

		if (!formData.phone || formData.phone.length !== 10) {
			toast.error("Please enter a valid 10-digit phone number");
			return;
		}

		setLoading(true);
		try {
			// Check if CashFree SDK is available
			if (!isCashfreeAvailable()) {
				toast.error("Payment gateway not available. Please refresh the page.");
				return;
			}

			const apiUrl = API.CREATE_PAYMENT_LINK(editor._id, plan);
			console.log("API URL:", apiUrl);
			console.log("Sending payment request for:", { editorId: editor._id, plan, formData });

			const response = await axiosInstance.post(apiUrl, {
				phone: formData.phone,
				creatorNote: formData.creatorNote,
			});

			// console.log("Payment response:", response.data);

			// Extract payment session ID from the response
			const paymentSessionId = response.data.paymentSessionId || response.data.raw?.payment_session_id;
			if (!paymentSessionId) {
				toast.error("Invalid payment response from server");
				return;
			}

			// console.log("Payment Session ID:", paymentSessionId);

			// Launch CashFree checkout using SDK
			await launchCashfreeCheckout(paymentSessionId);
			toast.success("Payment checkout launched!");
			onClose(); // Close the modal after launching checkout
		} catch (error) {
			console.error("Payment creation failed:", error);
			toast.error(error.response?.data?.message || "Failed to create payment link");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-roseclub-dark">Complete Payment</h2>
					<button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800 transition">
						×
					</button>
				</div>

				<div className="mb-6 p-4 bg-roseclub-paper rounded-lg">
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm text-gray-600">Editor:</span>
						<span className="font-semibold text-roseclub-dark">{editor.username}</span>
					</div>
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm text-gray-600">Plan:</span>
						<span className="font-semibold text-roseclub-dark capitalize">{plan}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-600">Amount:</span>
						<span className="font-bold text-roseclub-accent text-lg">₹{amount}</span>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
							Phone Number *
						</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleInputChange}
							placeholder="Enter 10-digit phone number"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roseclub-accent focus:border-transparent"
							maxLength="10"
							required
						/>
					</div>

					<div>
						<label htmlFor="creatorNote" className="block text-sm font-medium text-gray-700 mb-2">
							Note to Editor (Optional)
						</label>
						<textarea
							id="creatorNote"
							name="creatorNote"
							value={formData.creatorNote}
							onChange={handleInputChange}
							placeholder="Any specific requirements or notes for the editor..."
							rows="3"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roseclub-accent focus:border-transparent resize-none"
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex-1 px-4 py-2 bg-roseclub-accent text-white rounded-lg hover:bg-roseclub-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<div className="flex items-center justify-center">
									<LoaderSpinner size="sm" />
									<span className="ml-2">Processing...</span>
								</div>
							) : (
								`Pay ₹${amount}`
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default PaymentModal;
