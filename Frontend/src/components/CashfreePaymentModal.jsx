// src/components/CashfreePaymentModal.jsx
import React, { useEffect, useRef } from "react";
import { load } from "@cashfreepayments/cashfree-js";

const CashfreePaymentModal = ({ paymentSessionId, onClose }) => {
	const containerRef = useRef(null);
	console.log(paymentSessionId, "paymentSessionId");
	useEffect(() => {
		const initiatePayment = async () => {
			await load({ mode: "sandbox" }); // Change to "production" in prod
			const cashfree = window.cashfree;
			if (cashfree && containerRef.current) {
				cashfree.checkout({
					paymentSessionId,
					redirectTarget: "_modal",
					container: containerRef.current,
				});
			}
		};

		initiatePayment();
	}, [paymentSessionId]);

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
			<div className="bg-white p-4 rounded shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-lg font-semibold text-gray-800">Complete Your Payment</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
						✕
					</button>
				</div>
				<div ref={containerRef}></div>
			</div>
		</div>
	);
};

export default CashfreePaymentModal;
