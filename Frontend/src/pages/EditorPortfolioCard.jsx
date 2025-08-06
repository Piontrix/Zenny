import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axios";
import API from "../constants/api";
import toast from "react-hot-toast";
import LoaderSpinner from "../components/common/LoaderSpinner";
import { Link } from "react-router-dom";
import PhoneNumberModal from "../components/PhoneNumberModal";
import CashfreePaymentModal from "../components/CashfreePaymentModal";

const EditorPortfolioCard = ({ editor }) => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [selectedTier, setSelectedTier] = useState(null);
	const [pendingTier, setPendingTier] = useState(null);
	const [showPhoneModal, setShowPhoneModal] = useState(false);
	const [paymentSessionId, setPaymentSessionId] = useState("null");

	const handleStartChat = async () => {
		if (!user || user.role !== "creator") {
			toast.error("Only creators can start chat. Redirecting to login...");
			navigate("/login");
			return;
		}

		setLoading(true);
		try {
			const res = await axiosInstance.post(API.INITIATE_CHAT, { editorId: editor._id });
			navigate(`/chat?roomId=${res.data.roomId}`);
		} catch (err) {
			console.error("Chat initiation failed", err);
			toast.error("Failed to start chat.");
		} finally {
			setLoading(false);
		}
	};

	const handlePhoneSubmit = async (phone) => {
		setShowPhoneModal(false);

		if (!user) {
			toast.error("Please log in to proceed with payment.");
			navigate("/login");
			return;
		}

		if (!pendingTier) {
			toast.error("No plan selected.");
			return;
		}

		try {
			setLoading(true);

			const res = await axiosInstance.post(API.INITIATE_PAYMENT(editor._id, pendingTier.title.toLowerCase()), {
				phone,
			});

			if (res.data?.raw?.payment_session_id) {
				setPaymentSessionId(res.data.raw.payment_session_id);
			} else {
				toast.error("Unable to get valid payment session.");
			}
		} catch (err) {
			console.error(err);
			toast.error("Payment initiation failed.");
		} finally {
			setLoading(false);
		}
	};

	const formatPrice = (pricing) => {
		if (!pricing || pricing.length === 0) return "Contact for pricing";

		const price = pricing[0];
		if (price.priceMax) {
			return `₹${price.priceMin} - ₹${price.priceMax}`;
		}
		return `₹${price.priceMin}`;
	};

	const getTierColor = (tier) => {
		switch (tier) {
			case "basic":
				return "bg-roseclub-light text-roseclub-dark";
			case "intermediate":
				return "bg-roseclub-medium text-white";
			case "pro":
				return "bg-roseclub-dark text-white";
			default:
				return "bg-gray-200 text-gray-800";
		}
	};

	// Return null if editor has no portfolio
	if (!editor.portfolio || !editor.portfolio.tiers) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6 border border-roseclub-light">
				<div className="text-center">
					<h3 className="text-xl font-semibold text-roseclub-dark mb-2">{editor.username}</h3>
					<p className="text-gray-600 mb-4">Portfolio not available yet</p>
					<button
						onClick={handleStartChat}
						disabled={loading}
						className="px-6 py-2 bg-roseclub-accent text-white rounded-lg hover:bg-roseclub-dark transition-colors disabled:opacity-50"
					>
						{loading ? <LoaderSpinner size="sm" /> : "Start Chat"}
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="bg-white rounded-lg shadow-lg border border-roseclub-light overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-roseclub-light to-roseclub-medium p-6">
					<h3 className="text-2xl font-bold text-roseclub-dark mb-2">{editor.username}</h3>
					<p className="text-roseclub-dark/80">Professional Video Editor</p>
				</div>

				{/* Portfolio Content */}
				<div className="p-6">
					{/* What's Included */}
					{editor.portfolio.whatsIncluded && editor.portfolio.whatsIncluded.length > 0 && (
						<div className="mb-6">
							<h4 className="text-lg font-semibold text-roseclub-dark mb-3">What's Included</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								{editor.portfolio.whatsIncluded.map((item, index) => (
									<div key={index} className="flex items-center text-sm text-gray-700">
										<span className="text-roseclub-accent mr-2">✓</span>
										{item}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Tiers */}
					<div className="space-y-4">
						<h4 className="text-lg font-semibold text-roseclub-dark mb-3">Editing Tiers</h4>
						{editor.portfolio.tiers.map((tier, index) => (
							<div key={index} className="border border-roseclub-light rounded-lg p-4">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-3">
										<span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(tier.title)}`}>
											{tier.title.charAt(0).toUpperCase() + tier.title.slice(1)}
										</span>
										<h5 className="font-semibold text-roseclub-dark">{tier.description || `${tier.title} Editing`}</h5>
									</div>
									<div className="flex flex-col items-end">
										<span className="text-lg font-bold text-roseclub-accent">{formatPrice(tier.pricing)}</span>

										{user && user.role === "creator" && (
											<button
												className="mt-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
												onClick={() => {
													setPendingTier(tier);
													setShowPhoneModal(true);
												}}
											>
												Pay Now
											</button>
										)}
									</div>
								</div>

								{/* Features */}
								{tier.features && tier.features.length > 0 && (
									<div className="mb-3">
										<p className="text-sm text-gray-600 mb-2">Features:</p>
										<div className="flex flex-wrap gap-2">
											{tier.features.map((feature, idx) => (
												<span key={idx} className="px-2 py-1 bg-roseclub-paper text-roseclub-dark text-xs rounded">
													{feature}
												</span>
											))}
										</div>
									</div>
								)}

								{/* Samples */}
								{/* {tier.samples && tier.samples.length > 0 && (
								<div>
									<p className="text-sm text-gray-600 mb-2">Samples:</p>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
										{tier.samples.slice(0, 6).map((sample, idx) => (
											<div
												key={idx}
												className="relative group cursor-pointer"
												onClick={() => setSelectedTier({ tier, sample })}
											>
												{sample.type === "video" ? (
													<div className="relative aspect-video rounded-lg overflow-hidden">
														<img
															src={sample.thumbnailUrl || "/fallback-thumbnail.jpg"}
															alt={`Video Thumbnail ${idx + 1}`}
															className="w-full h-full object-cover"
														/>
														<div className="absolute inset-0 flex items-center justify-center bg-black/30">
															<span className="text-white text-2xl">▶</span>
														</div>
													</div>
												) : (
													<img
														src={sample.url}
														alt={`Sample ${idx + 1}`}
														className="w-full h-24 object-cover rounded-lg"
													/>
												)}

												{sample.tags && sample.tags.length > 0 && (
													<div className="absolute bottom-1 left-1 right-1">
														<div className="flex flex-wrap gap-1">
															{sample.tags.slice(0, 2).map((tag, tagIdx) => (
																<span key={tagIdx} className="px-1 py-0.5 bg-black/70 text-white text-xs rounded">
																	{tag}
																</span>
															))}
														</div>
													</div>
												)}
											</div>
										))}
									</div>
									{tier.samples.length > 6 && (
										<button
											className="text-xs text-roseclub-accent hover:underline mt-2"
											onClick={() => setSelectedTier({ tier, showAllSamples: true })}
										>
											+{tier.samples.length - 6} more samples
										</button>
									)}
								</div>
							)} */}
							</div>
						))}
					</div>

					{/* Action Button */}
					<div className="mt-6 pt-4 border-t border-roseclub-light">
						<Link to={`/portfolio/${editor._id}`}>
							<button className="mt-4 px-4 py-2 bg-roseclub-accent text-white rounded-lg hover:bg-roseclub-dark transition w-full mb-4">
								View Portfolio
							</button>
						</Link>
						<button
							onClick={handleStartChat}
							disabled={loading}
							className="w-full px-6 py-3 bg-roseclub-accent text-white rounded-lg hover:bg-roseclub-dark transition-colors disabled:opacity-50 font-semibold"
						>
							{loading ? (
								<div className="flex items-center justify-center">
									<LoaderSpinner size="sm" />
									<span className="ml-2">Starting Chat...</span>
								</div>
							) : (
								"Start Chat with Editor"
							)}
						</button>
					</div>
				</div>

				{/* Sample Modal */}
				{selectedTier && (
					<div
						className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
						onClick={() => setSelectedTier(null)}
					>
						<div
							className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold text-roseclub-dark">
									{selectedTier.tier.title.charAt(0).toUpperCase() + selectedTier.tier.title.slice(1)}{" "}
									{selectedTier.showAllSamples ? "Samples" : "Sample"}
								</h3>
								<button
									onClick={() => setSelectedTier(null)}
									className="text-gray-500 hover:text-gray-700 text-xl font-bold"
								>
									✕
								</button>
							</div>

							{selectedTier.showAllSamples ? (
								// All samples view
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									{selectedTier.tier.samples.map((sample, idx) => (
										<div key={idx} className="bg-gray-100 rounded-lg overflow-hidden">
											{sample.type === "video" ? (
												<video src={sample.url} controls className="w-full h-48 object-cover" />
											) : (
												<img src={sample.url} alt={`Sample ${idx + 1}`} className="w-full h-48 object-cover" />
											)}
											{/* Tags */}
											{sample.tags?.length > 0 && (
												<div className="p-2">
													<div className="flex flex-wrap gap-1">
														{sample.tags.map((tag, tagIdx) => (
															<span
																key={tagIdx}
																className="px-2 py-1 bg-roseclub-paper text-roseclub-dark text-xs rounded"
															>
																{tag}
															</span>
														))}
													</div>
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								// Single sample view
								<>
									<div className="w-full h-[60vh] rounded-lg overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
										{selectedTier.sample.type === "video" ? (
											<video
												src={selectedTier.sample.url}
												controls
												className="w-full h-full object-contain rounded-lg"
											/>
										) : (
											<img
												src={selectedTier.sample.url}
												alt="Sample"
												className="w-full h-full object-contain rounded-lg"
											/>
										)}
									</div>

									{/* Tags */}
									{selectedTier.sample.tags?.length > 0 && (
										<div className="mt-2">
											<p className="text-sm text-gray-600 mb-2">Tags:</p>
											<div className="flex flex-wrap gap-2">
												{selectedTier.sample.tags.map((tag, idx) => (
													<span key={idx} className="px-2 py-1 bg-roseclub-paper text-roseclub-dark text-sm rounded">
														{tag}
													</span>
												))}
											</div>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				)}
			</div>
			{showPhoneModal && <PhoneNumberModal onClose={() => setShowPhoneModal(false)} onSubmit={handlePhoneSubmit} />}

			{paymentSessionId && (
				<CashfreePaymentModal paymentSessionId={paymentSessionId} onClose={() => setPaymentSessionId(null)} />
			)}
		</>
	);
};

export default EditorPortfolioCard;
