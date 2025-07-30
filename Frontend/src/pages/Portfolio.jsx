import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import API from "../constants/api";
import EditorPortfolioCard from "./EditorPortfolioCard";
import toast from "react-hot-toast";
import LoaderSpinner from "../components/common/LoaderSpinner";

const Portfolio = () => {
	const [editors, setEditors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchEditors = async () => {
			try {
				const res = await axiosInstance.get(API.GET_ALL_EDITORS);
				setEditors(res.data.data);
			} catch (err) {
				console.error("Error fetching editors", err);
				setError("Failed to load editors. Please try again.");
				toast.error("Failed to load editors");
			} finally {
				setLoading(false);
			}
		};
		fetchEditors();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-roseclub-paper flex items-center justify-center">
				<div className="text-center">
					<LoaderSpinner size="lg" />
					<p className="mt-4 text-roseclub-dark">Loading editor portfolios...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-roseclub-paper">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-roseclub-light to-roseclub-medium py-12">
				<div className="max-w-7xl mx-auto px-6">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-roseclub-dark mb-4">Editor Portfolios</h1>
						<p className="text-xl text-roseclub-dark/80 max-w-2xl mx-auto">
							Discover talented video editors and their work. Browse through portfolios, view samples, and connect with
							editors who match your creative vision.
						</p>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className="max-w-7xl mx-auto px-6 py-12">
				{error ? (
					<div className="text-center py-12">
						<div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
							<p className="text-roseclub-dark text-lg mb-4">{error}</p>
							<button
								onClick={() => window.location.reload()}
								className="px-6 py-2 bg-roseclub-accent text-white rounded-lg hover:bg-roseclub-dark transition-colors"
							>
								Try Again
							</button>
						</div>
					</div>
				) : editors.length === 0 ? (
					<div className="text-center py-12">
						<div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
							<div className="text-6xl mb-4">🎬</div>
							<h3 className="text-xl font-semibold text-roseclub-dark mb-2">No Editors Available</h3>
							<p className="text-gray-600">We're currently setting up our editor network. Check back soon!</p>
						</div>
					</div>
				) : (
					<div className="space-y-8">
						{/* Stats */}
						<div className="bg-white rounded-lg shadow-md p-6 mb-8">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
								<div>
									<div className="text-3xl font-bold text-roseclub-accent">{editors.length}</div>
									<div className="text-gray-600">Available Editors</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-roseclub-accent">
										{editors.filter((e) => e.portfolio?.tiers?.length > 0).length}
									</div>
									<div className="text-gray-600">With Portfolios</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-roseclub-accent">
										{editors.reduce((total, e) => {
											const samples =
												e.portfolio?.tiers?.reduce((sum, tier) => sum + (tier.samples?.length || 0), 0) || 0;
											return total + samples;
										}, 0)}
									</div>
									<div className="text-gray-600">Total Samples</div>
								</div>
							</div>
						</div>

						{/* Editor Cards */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{editors.map((editor) => (
								<EditorPortfolioCard key={editor._id} editor={editor} />
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Portfolio;
