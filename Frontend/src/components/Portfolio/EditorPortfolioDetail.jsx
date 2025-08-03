import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axios";
import API from "../../constants/api";
import LoaderSpinner from "../common/LoaderSpinner";

const EditorPortfolioDetail = () => {
	const { editorId } = useParams();
	const [editor, setEditor] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [previewSample, setPreviewSample] = useState(null); // modal state

	useEffect(() => {
		const fetchEditor = async () => {
			try {
				const res = await axiosInstance.get(API.GET_EDITOR_BY_ID(editorId));
				setEditor(res.data.data);
			} catch (err) {
				console.error("Error fetching editor portfolio", err);
				setError("Failed to load portfolio.");
			} finally {
				setLoading(false);
			}
		};
		fetchEditor();
	}, [editorId]);

	if (loading) {
		return (
			<div className="min-h-screen flex justify-center items-center">
				<LoaderSpinner size="lg" />
			</div>
		);
	}

	if (error || !editor) {
		return (
			<div className="text-center mt-20">
				<p className="text-xl text-red-500">{error}</p>
				<Link to="/portfolio" className="text-blue-500 underline mt-4 block">
					Back to Portfolio List
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-roseclub-paper px-4 py-10">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl sm:text-4xl font-bold text-roseclub-dark mb-8">{editor.username}'s Portfolio</h1>

				{editor.portfolio?.tiers?.map((tier, idx) => (
					<div key={idx} className="mb-14">
						<h2 className="text-2xl sm:text-3xl font-semibold text-roseclub-accent capitalize mb-2">
							{tier.title} Tier
						</h2>
						<p className="mb-4 text-roseclub-dark/80">{tier.description}</p>

						{tier.samples?.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
								{tier.samples.map((sample, i) => (
									<div
										key={i}
										className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all overflow-hidden cursor-pointer"
										onClick={() => setPreviewSample(sample)} // trigger modal
									>
										{sample.type === "video" ? (
											<video
												src={sample.url}
												className="w-full h-52 object-cover pointer-events-none"
												muted
												playsInline
											/>
										) : (
											<img src={sample.url} alt="Sample" className="w-full h-52 object-cover" />
										)}

										<div className="p-4 border-t">
											<div className="flex flex-wrap gap-2">
												{sample.tags?.map((tag, index) => (
													<span
														key={index}
														className="bg-roseclub-light text-xs font-medium px-2 py-1 rounded-full text-roseclub-dark"
													>
														#{tag}
													</span>
												))}
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-gray-500 italic">No samples uploaded yet.</p>
						)}
					</div>
				))}

				<Link
					to="/portfolio"
					className="inline-block mt-10 px-5 py-2 bg-roseclub-accent text-white rounded-full hover:bg-roseclub-dark transition"
				>
					← Back to All Portfolios
				</Link>
			</div>

			{/* Modal */}
			{previewSample && (
				<div
					className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
					onClick={() => setPreviewSample(null)}
				>
					<div
						className="relative bg-white rounded-3xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Sticky Close & Tags */}
						<div className="sticky top-0 z-10 bg-white px-6 pt-5 pb-3 border-b border-gray-100 flex items-start justify-between">
							<div className="flex flex-wrap gap-2">
								{previewSample.tags?.map((tag, index) => (
									<span
										key={index}
										className="bg-[#ffeef3] text-[#ff3860] text-xs font-semibold px-3 py-1 rounded-full"
									>
										#{tag}
									</span>
								))}
							</div>

							<button
								className="text-2xl text-gray-500 hover:text-gray-800 transition"
								onClick={() => setPreviewSample(null)}
							>
								×
							</button>
						</div>

						{/* Scrollable Preview */}
						<div className="overflow-y-auto px-6 pb-6 pt-2">
							{previewSample.type === "video" ? (
								<video src={previewSample.url} controls autoPlay className="w-full rounded-xl" />
							) : (
								<img src={previewSample.url} alt="Preview" className="w-full rounded-xl" />
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EditorPortfolioDetail;
