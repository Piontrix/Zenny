import { useEffect, useState } from "react";
import API from "../../constants/api";
import axiosInstance from "../../api/axios";

const AdminSupportTickets = () => {
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchTickets = async () => {
			try {
				const res = await axiosInstance.get(API.ADMIN_GET_ALL_TICKETS);
				// console.log(res.data);
				if (Array.isArray(res.data)) {
					setTickets(res.data);
				} else {
					setTickets([]);
				}
			} catch (err) {
				console.error("Failed to fetch tickets", err);
				setError("Failed to load support tickets.");
			} finally {
				setLoading(false);
			}
		};

		fetchTickets();
	}, []);

	return (
		<div>
			<h1 className="text-2xl font-bold mb-6">Support Tickets</h1>

			{loading ? (
				<p className="text-gray-500">Loading...</p>
			) : error ? (
				<p className="text-red-500">{error}</p>
			) : tickets.length === 0 ? (
				<p className="text-gray-500">No support tickets found.</p>
			) : (
				<div className="space-y-4">
					{tickets.map((ticket) => (
						<div key={ticket._id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
							<p className="font-bold text-lg">{ticket.subject}</p>
							<p className="text-sm text-gray-700">
								<strong>From:</strong> {ticket.name} ({ticket.email})
							</p>
							<p className="text-gray-600 mt-2">{ticket.message}</p>
							<p className="text-xs text-gray-400 mt-2">Submitted on: {new Date(ticket.createdAt).toLocaleString()}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default AdminSupportTickets;
