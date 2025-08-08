import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axios";
import API from "../constants/api";
import LoaderSpinner from "../components/common/LoaderSpinner";

const PaymentSuccess = () => {
	const [searchParams] = useSearchParams();
	const { user } = useAuth();
	const [orderId, setOrderId] = useState("");
	const [payment, setPayment] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const orderIdParam = searchParams.get("order_id");
		if (orderIdParam) {
			setOrderId(orderIdParam);
			fetchPaymentStatus(orderIdParam);
		} else {
			setLoading(false);
		}
	}, [searchParams]);

	const fetchPaymentStatus = async (orderId) => {
		try {
			const response = await axiosInstance.get(API.GET_PAYMENT_STATUS(orderId));
			setPayment(response.data.payment);
		} catch (error) {
			console.error("Failed to fetch payment status:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-roseclub-paper flex items-center justify-center px-4">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<LoaderSpinner size="lg" />
					<p className="mt-4 text-gray-600">Loading payment status...</p>
				</div>
			</div>
		);
	}

	const getStatusIcon = () => {
		switch (payment?.status) {
			case "SUCCESS":
				return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
			case "INITIATED":
				return <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />;
			case "FAILED":
				return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
			default:
				return <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />;
		}
	};

	const getStatusMessage = () => {
		switch (payment?.status) {
			case "SUCCESS":
				return {
					title: "Payment Successful!",
					message:
						"Your payment has been processed successfully. The editor will be notified and will start working on your project.",
				};
			case "INITIATED":
				return {
					title: "Payment Processing",
					message: "Your payment is being processed. Please wait while we confirm the transaction.",
				};
			case "FAILED":
				return {
					title: "Payment Failed",
					message: "Your payment could not be processed. Please try again or contact support.",
				};
			default:
				return {
					title: "Payment Status Unknown",
					message: "We're unable to determine the status of your payment. Please contact support.",
				};
		}
	};

	const statusInfo = getStatusMessage();

	return (
		<div className="min-h-screen bg-roseclub-paper flex items-center justify-center px-4">
			<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
				<div className="mb-6">
					{getStatusIcon()}
					<h1 className="text-2xl font-bold text-roseclub-dark mb-2">{statusInfo.title}</h1>
					<p className="text-gray-600">{statusInfo.message}</p>
				</div>

				{payment && (
					<div className="mb-6 p-4 bg-roseclub-paper rounded-lg space-y-2">
						<div className="flex justify-between">
							<span className="text-sm text-gray-600">Order ID:</span>
							<span className="font-mono text-sm text-roseclub-dark">{payment.orderId}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-gray-600">Amount:</span>
							<span className="font-semibold text-roseclub-dark">₹{payment.amount}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-gray-600">Plan:</span>
							<span className="capitalize text-roseclub-dark">{payment.planType}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-gray-600">Editor:</span>
							<span className="text-roseclub-dark">{payment.editor?.username}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-gray-600">Status:</span>
							<span
								className={`font-semibold ${
									payment.status === "SUCCESS"
										? "text-green-600"
										: payment.status === "FAILED"
										? "text-red-600"
										: "text-yellow-600"
								}`}
							>
								{payment.status}
							</span>
						</div>
					</div>
				)}

				<div className="space-y-3">
					<Link
						to="/chat"
						className="block w-full px-6 py-3 bg-roseclub-accent text-white rounded-lg hover:bg-roseclub-dark transition font-semibold"
					>
						Go to Chat
					</Link>
					<Link
						to="/portfolio"
						className="block w-full px-6 py-3 border border-roseclub-accent text-roseclub-accent rounded-lg hover:bg-roseclub-accent hover:text-white transition font-semibold"
					>
						Browse More Editors
					</Link>
				</div>

				<div className="mt-6 text-sm text-gray-500">
					<p>You will receive an email confirmation shortly.</p>
					<p>For any questions, please contact support.</p>
				</div>
			</div>
		</div>
	);
};

export default PaymentSuccess;
