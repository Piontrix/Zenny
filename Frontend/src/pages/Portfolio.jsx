import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axios"; // ✅ use axiosInstance
import API from "../constants/api";

const Portfolio = () => {
	const { user } = useAuth();
	const [editors, setEditors] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchEditors = async () => {
			try {
				const res = await axiosInstance.get(API.GET_ALL_EDITORS);
				setEditors(res.data.data);
			} catch (err) {
				console.error("Error fetching editors", err);
			}
		};
		fetchEditors();
	}, []);

	const handleStartChat = async (editorId) => {
		if (!user || user.role !== "creator") {
			alert("Only creators can start chat. Redirecting to login...");
			navigate("/login");
			return;
		}

		try {
			const res = await axiosInstance.post(API.INITIATE_CHAT, { editorId });
			navigate(`/chat?roomId=${res.data.roomId}`);
		} catch (err) {
			console.error("Chat initiation failed", err);
			alert("Failed to start chat.");
		}
	};

	return (
		<div className="p-6">
			<h2 className="text-2xl font-bold mb-4">Editor Portfolio</h2>
			{editors?.length === 0 ? (
				<p>No editors available yet.</p>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{editors.map((editor) => (
						<div key={editor._id} className="p-4 bg-white rounded shadow">
							<h3 className="text-lg font-semibold">{editor.username}</h3>
							<button
								onClick={() => handleStartChat(editor._id)}
								className="mt-2 px-4 py-1 bg-roseclub-accent text-white rounded hover:bg-roseclub-dark"
							>
								Start Chat
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Portfolio;
