import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import LoaderSpinner from "./common/LoaderSpinner";
import API from "../constants/api";

const AdminPayments = () => {
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPayments = async () => {
			try {
				setLoading(true);
				const res = await axiosInstance.get(API.ADMIN_GET_ALL_PAYMENTS);

				setPayments(res?.data?.payments || []);
			} catch (err) {
				console.error("Failed to load admin payments:", err);
				setError("Failed to load payments.");
			} finally {
				setLoading(false);
			}
		};

		fetchPayments();
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-48">
				<LoaderSpinner size="lg" />
			</div>
		);
	}

	if (error) return <div className="text-red-500">{error}</div>;

	const getStatusColor = (status) => {
		switch (status) {
			case "SUCCESS":
				return "bg-green-100 text-green-800";
			case "FAILED":
				return "bg-red-100 text-red-800";
			case "INITIATED":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div>
			<h3 className="text-xl font-semibold mb-4">All Payments</h3>
			{payments.length === 0 ? (
				<p className="text-gray-500">No payments found.</p>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
						<thead>
							<tr className="bg-gray-50 border-b">
								<th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
								<th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Amount</th>
								<th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
								<th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Order ID</th>
								<th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Payment Made</th>{" "}
								{/* single combined */}
							</tr>
						</thead>

						<tbody>
							{payments
								.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
								.map((p) => (
									<tr key={p._id} className="border-b hover:bg-gray-50">
										<td className="px-4 py-2 text-sm text-gray-700">{new Date(p.createdAt).toLocaleString()}</td>
										<td className="px-4 py-2 text-sm font-semibold text-gray-900">₹{p.amount?.toLocaleString()}</td>
										<td className="px-4 py-2">
											<span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(p.status)}`}>
												{p.status}
											</span>
										</td>
										<td className="px-4 py-2 text-sm text-gray-600">
											{p.orderId || p.cfOrderId || p.cfPaymentId || "—"}
										</td>
										<td className="px-4 py-2 text-sm text-gray-700">
											Payment made by <strong>{p.creator?.username || "Unknown"}</strong> to{" "}
											<strong>{p.editor?.username || "Unknown"}</strong>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default AdminPayments;
