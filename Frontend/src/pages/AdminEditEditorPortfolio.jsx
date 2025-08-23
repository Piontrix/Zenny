import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const fileInputRefs = useRef({});

  const MAX_IMAGE_SIZE_MB = Number(import.meta.env.VITE_MAX_IMAGE_SIZE) || 10;
  const MAX_VIDEO_SIZE_MB = Number(import.meta.env.VITE_MAX_VIDEO_SIZE) || 100;

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

  useEffect(() => {
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

    setFileInputs((prev) => ({
      ...prev,
      [tier]: allowedFiles.length ? allowedFiles : undefined,
    }));
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
      Object.values(fileInputRefs.current).forEach((input) => {
        if (input) input.value = "";
      });
      fetchEditor(); // refresh portfolio
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setSubmitting(false);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteSample = async (tierTitle, sampleUrl) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await axiosInstance.delete(
        API.ADMIN_DELETE_EDITOR_PORTFOLIO_SAMPLE(editor._id, tierTitle),
        { data: { sampleUrl } } // ✅ send in body
      );
      toast.success("Deleted successfully!");
      fetchEditor(); // refresh after deletion
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed.");
    }
  };

  useEffect(() => {
    if (editor?.username) setNewName(editor.username);
  }, [editor]);

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await axiosInstance.post(API.ADMIN_UPDATE_EDITOR_NAME(editor._id), {
        username: newName.trim(),
      });
      toast.success("Editor name updated successfully!");
      setIsEditingName(false);
      fetchEditor(); // refresh with updated name
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <LoaderSpinner size="lg" className="mt-10" />;

  const hasTiers = editor?.portfolio?.tiers?.length > 0;

  return (
    <div className="relative">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-md">
        <div className="flex items-center gap-3 mb-6">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <button onClick={handleUpdateName} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false);
                  setNewName(editor.username);
                }}
                className="bg-gray-300 px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold">Manage Portfolio - {editor.username}</h2>
              <button onClick={() => setIsEditingName(true)} className="text-gray-600 hover:text-roseclub-accent">
                <Pencil className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {!hasTiers ? (
          <p className="text-center text-gray-500 py-10 border rounded bg-gray-50">
            ⚠️ Please add structure (portfolio tiers) to this editor before uploading samples.
          </p>
        ) : (
          editor.portfolio.tiers.map((tier) => (
            <div key={tier.title} className="mb-10">
              <h3 className="text-lg font-semibold capitalize mb-3 text-roseclub-accent">{tier.title} Tier</h3>

              {/* Upload new files */}
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                ref={(el) => (fileInputRefs.current[tier.title] = el)}
                onChange={(e) => handleFileChange(tier.title, e.target.files, e)}
                className="mb-3 block w-full text-sm"
              />

              {/* Show existing uploaded files */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tier.samples?.map((sample) => (
                  <div key={sample._id} className="relative border rounded-md p-2 bg-gray-50">
                    {sample.type.startsWith("image") ? (
                      <img src={sample.url} alt="portfolio" className="w-full h-40 object-cover rounded" />
                    ) : (
                      <video src={sample.url} controls className="w-full h-40 object-cover rounded" />
                    )}

                    <button
                      onClick={() => handleDeleteSample(tier.title, sample.url)}
                      className="absolute top-2 right-2 bg-white p-1 rounded-full shadow hover:bg-red-100"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Pending new files with tags */}
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
                    <div key={i} className="mt-4 border p-4 rounded-md bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-2">New File: {file.name}</p>

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
            Upload New Samples
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
