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
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);

	// Read image/video max size from env (in MB)
	const MAX_IMAGE_SIZE_MB = Number(import.meta.env.VITE_MAX_IMAGE_SIZE) || 10;
	const MAX_VIDEO_SIZE_MB = Number(import.meta.env.VITE_MAX_VIDEO_SIZE) || 100;

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

	const handleFileChange = (tier, files, e) => {
		const fileArray = Array.from(files);

		const oversizedFiles = fileArray.filter((file) => {
			if (file.type.startsWith("image/")) {
				return file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024;
			} else if (file.type.startsWith("video/")) {
				return file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024;
			}
			// Reject other types by default
			return true;
		});

		const allowedFiles = fileArray.filter((file) => {
			if (file.type.startsWith("image/")) {
				return file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024;
			} else if (file.type.startsWith("video/")) {
				return file.size <= MAX_VIDEO_SIZE_MB * 1024 * 1024;
			}
			return false;
		});

		if (oversizedFiles.length > 0) {
			toast.error(
				`Some files exceed size limits (Images: ${MAX_IMAGE_SIZE_MB}MB, Videos: ${MAX_VIDEO_SIZE_MB}MB): ${oversizedFiles
					.map((f) => f.name)
					.join(", ")}`
			);
			if (e?.target) e.target.value = "";
		}

		setFileInputs((prev) => ({ ...prev, [tier]: allowedFiles.length ? allowedFiles : undefined }));
	};

	const handleUpload = async () => {
		if (!editor) return;

		const formData = new FormData();
		Object.entries(fileInputs).forEach(([tier, files]) => {
			Array.from(files).forEach((file, idx) => {
				formData.append(`${tier}_${idx}`, file);
				const tagKey = `${tier}_sample_${idx}_tags`;
				formData.append(tagKey, JSON.stringify(tagsInputs[tagKey] || []));
			});
		});

		setSubmitting(true);
		setIsProcessing(true);
		setUploadProgress(0);

		try {
			const res = await axiosInstance.patch(API.ADMIN_UPLOAD_EDITOR_PORTFOLIO_SAMPLES(editor._id), formData, {
				headers: { "Content-Type": "multipart/form-data" },
				onUploadProgress: (progressEvent) => {
					if (progressEvent.total) {
						const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						setUploadProgress(percent);
					}
				},
			});

			toast.success(res.data.message || "Uploaded!");
			setFileInputs({});
			setTagsInputs({});
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.message || "Upload failed.");
		} finally {
			setSubmitting(false);
			setIsProcessing(false);
			setUploadProgress(0);
		}
	};

	if (loading) return <LoaderSpinner size="lg" className="mt-10" />;

	const hasTiers = editor?.portfolio?.tiers?.length > 0;

	return (
		<div className="relative">
			<div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-md">
				<h2 className="text-2xl font-bold mb-6">Upload Portfolio Samples - {editor.username}</h2>

				{!hasTiers ? (
					<p className="text-center text-gray-500 py-10 border rounded bg-gray-50">
						⚠️ Please add structure (portfolio tiers) to this editor before uploading samples.
					</p>
				) : (
					editor.portfolio.tiers.map((tier) => (
						<div key={tier.title} className="mb-8">
							<h3 className="text-lg font-semibold capitalize mb-2 text-roseclub-accent">{tier.title} Tier</h3>

							<input
								type="file"
								multiple
								accept="image/*,video/*"
								onChange={(e) => handleFileChange(tier.title, e.target.files, e)}
								className="mb-3 block w-full text-sm"
							/>

							{fileInputs[tier.title] &&
								Array.from(fileInputs[tier.title]).map((file, i) => {
									const tagKey = `${tier.title}_sample_${i}_tags`;
									const tags = tagsInputs[tagKey] || [];

									const addTag = (e) => {
										if (e.key === "Enter" || e.key === ",") {
											e.preventDefault();
											const newTag = e.target.value.trim();
											if (newTag && !tags.includes(newTag)) {
												setTagsInputs((prev) => ({
													...prev,
													[tagKey]: [...tags, newTag],
												}));
											}
											e.target.value = "";
										}
									};

									const removeTag = (tagToRemove) => {
										setTagsInputs((prev) => ({
											...prev,
											[tagKey]: tags.filter((tag) => tag !== tagToRemove),
										}));
									};

									return (
										<div key={i} className="mb-4 border p-4 rounded-md bg-gray-50">
											<p className="text-sm font-medium text-gray-700 mb-2">File: {file.name}</p>

											<div className="flex flex-wrap gap-2 mb-2">
												{tags.map((tag, idx) => (
													<span
														key={idx}
														className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs flex items-center gap-1"
													>
														{tag}
														<button
															onClick={() => removeTag(tag)}
															className="text-pink-500 hover:text-red-500 font-bold text-xs ml-1"
														>
															×
														</button>
													</span>
												))}
											</div>

											<input
												type="text"
												placeholder="Type tag & press Enter or comma"
												onKeyDown={addTag}
												className="w-full border px-3 py-1 rounded text-sm"
											/>
										</div>
									);
								})}
						</div>
					))
				)}

				{hasTiers && (
					<button
						onClick={handleUpload}
						disabled={submitting}
						className="bg-roseclub-accent text-white px-5 py-2 rounded hover:bg-roseclub-dark disabled:opacity-50"
					>
						Upload Samples
					</button>
				)}
			</div>

			{/* Overlay */}
			{isProcessing && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center text-white text-lg font-semibold">
					<LoaderSpinner size="lg" />
					<p className="mt-4">
						{uploadProgress < 100
							? `Uploading ${uploadProgress}%`
							: "Processing upload. This may take some time, please be patient..."}
					</p>
				</div>
			)}
		</div>
	);
};

export default AdminEditEditorPortfolio;
