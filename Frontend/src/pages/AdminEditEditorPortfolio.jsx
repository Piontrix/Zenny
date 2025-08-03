import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axios";
import API from "../constants/api";
import LoaderSpinner from "../components/common/LoaderSpinner";

const AdminEditEditorPortfolio = () => {
	const { editorId } = useParams();
	const [editor, setEditor] = useState(null);
	const [loading, setLoading] = useState(true);
	const [fileInputs, setFileInputs] = useState({});
	const [tagsInputs, setTagsInputs] = useState({});
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const fetchEditor = async () => {
			try {
				const res = await axiosInstance.get(API.GET_EDITOR_BY_ID(editorId));
				setEditor(res.data.data);
			} catch (err) {
				console.error(err);
				toast.error("Failed to fetch editor.");
			} finally {
				setLoading(false);
			}
		};
		fetchEditor();
	}, [editorId]);

	const handleFileChange = (tier, files) => {
		setFileInputs((prev) => ({ ...prev, [tier]: files }));
	};

	const handleTagChange = (tier, index, value) => {
		setTagsInputs((prev) => ({
			...prev,
			[`${tier}_sample_${index}_tags`]: value,
		}));
	};

	const handleUpload = async () => {
		if (!editor) return;

		const formData = new FormData();
		Object.entries(fileInputs).forEach(([tier, files]) => {
			Array.from(files).forEach((file, idx) => {
				formData.append(`${tier}_${idx}`, file);
				formData.append(`${tier}_sample_${idx}_tags`, tagsInputs[`${tier}_sample_${idx}_tags`] || "[]");
			});
		});

		setSubmitting(true);
		try {
			const res = await axiosInstance.patch(API.ADMIN_UPLOAD_EDITOR_PORTFOLIO_SAMPLES(editor._id), formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			toast.success(res.data.message || "Uploaded!");
			setFileInputs({});
			setTagsInputs({});
		} catch (err) {
			console.error(err);
			toast.error("Upload failed.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <LoaderSpinner size="lg" className="mt-10" />;

	return (
		<div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-md">
			<h2 className="text-2xl font-bold mb-6">Upload Portfolio Samples - {editor.username}</h2>

			{editor.portfolio.tiers.map((tier) => (
				<div key={tier.title} className="mb-8">
					<h3 className="text-lg font-semibold capitalize mb-2 text-roseclub-accent">{tier.title} Tier</h3>
					<input
						type="file"
						multiple
						accept="image/*,video/*"
						onChange={(e) => handleFileChange(tier.title, e.target.files)}
						className="mb-2 block"
					/>

					{fileInputs[tier.title] &&
						Array.from(fileInputs[tier.title]).map((file, i) => (
							<div key={i} className="mb-3 border p-2 rounded bg-gray-50">
								<p className="font-medium text-sm text-gray-700 mb-1">File: {file.name}</p>
								<label className="block text-sm text-gray-600 mb-1">
									Tags for <span className="font-semibold">{file.name}</span>
								</label>
								<input
									type="text"
									placeholder='e.g., ["dance", "hook"]'
									className="border p-2 rounded w-full text-sm"
									value={tagsInputs[`${tier.title}_sample_${i}_tags`] || ""}
									onChange={(e) => handleTagChange(tier.title, i, e.target.value)}
								/>
							</div>
						))}
				</div>
			))}

			<button
				onClick={handleUpload}
				disabled={submitting}
				className="bg-roseclub-accent text-white px-5 py-2 rounded hover:bg-roseclub-dark disabled:opacity-50"
			>
				{submitting ? "Uploading..." : "Upload Samples"}
			</button>
		</div>
	);
};

export default AdminEditEditorPortfolio;
