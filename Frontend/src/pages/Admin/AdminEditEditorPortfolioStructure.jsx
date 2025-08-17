import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import axiosInstance from "../../api/axios";
import API from "../../constants/api";
import LoaderSpinner from "../../components/common/LoaderSpinner";

const defaultTiers = [
  { title: "basic", description: "", features: [], pricing: [{ reelCount: 0, priceMin: 0, priceMax: 0 }] },
  { title: "intermediate", description: "", features: [], pricing: [{ reelCount: 0, priceMin: 0, priceMax: 0 }] },
  { title: "pro", description: "", features: [], pricing: [{ reelCount: 0, priceMin: 0, priceMax: 0 }] },
];

const AdminEditEditorPortfolioStructure = () => {
  const { editorId } = useParams();
  const [editor, setEditor] = useState(null);
  const [tiers, setTiers] = useState(defaultTiers);
  const [whatsIncluded, setWhatsIncluded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEditor = async () => {
      try {
        const res = await axiosInstance.get(API.GET_EDITOR_BY_ID(editorId));
        const portfolio = res.data.data.portfolio;
        setEditor(res.data.data);

        // Normalize the 3 tiers if missing
        const existingTiers = portfolio.tiers || [];
        const updatedTiers = defaultTiers.map((def) => {
          const match = existingTiers.find((t) => t.title === def.title);
          return match || def;
        });
        setTiers(updatedTiers);

        setWhatsIncluded(portfolio.whatsIncluded || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch portfolio.");
      } finally {
        setLoading(false);
      }
    };
    fetchEditor();
  }, [editorId]);

  const handleTierChange = (index, key, value) => {
    setTiers((prev) => prev.map((tier, i) => (i === index ? { ...tier, [key]: value } : tier)));
  };

  const handlePricingChange = (index, field, value) => {
    setTiers((prev) =>
      prev.map((tier, i) =>
        i === index ? { ...tier, pricing: [{ ...tier.pricing[0], [field]: Number(value) }] } : tier
      )
    );
  };

  const handleFeatureAdd = (index, tag) => {
    if (!tag.trim()) return;
    setTiers((prev) =>
      prev.map((tier, i) =>
        i === index && !tier.features.includes(tag.trim())
          ? { ...tier, features: [...tier.features, tag.trim()] }
          : tier
      )
    );
  };

  const handleFeatureRemove = (index, tag) => {
    setTiers((prev) =>
      prev.map((tier, i) => (i === index ? { ...tier, features: tier.features.filter((t) => t !== tag) } : tier))
    );
  };

  const handleSubmit = async () => {
    if (!editor) return;
    setSubmitting(true);
    try {
      const payload = {
        tiers,
        whatsIncluded: whatsIncluded.filter(Boolean),
      };
      const res = await axiosInstance.patch(API.ADMIN_UPDATE_EDITOR_PORTFOLIO_STRUCTURE(editor._id), payload);
      toast.success(res.data.message || "Portfolio updated.");
    } catch (err) {
      console.error(err);
      toast.error("Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoaderSpinner size="lg" className="mt-10" />;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-md">
      <h2 className="text-2xl font-bold mb-6">Edit Portfolio Structure - {editor.username}</h2>

      {tiers.map((tier, idx) => (
        <div key={tier.title} className="mb-6 border rounded-md p-4 bg-gray-50">
          <h3 className="text-lg font-semibold capitalize text-roseclub-accent mb-2">{tier.title} Tier</h3>

          {/* Description */}
          <input
            type="text"
            value={tier.description}
            onChange={(e) => handleTierChange(idx, "description", e.target.value)}
            className="w-full border px-3 py-1 rounded mb-2"
            placeholder="Description"
          />

          {/* Features */}
          <div className="mb-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {tier.features.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                  <X className="w-4 h-4 cursor-pointer" onClick={() => handleFeatureRemove(idx, tag)} />
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add feature and press Enter"
              className="w-full border px-3 py-1 rounded"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleFeatureAdd(idx, e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              value={tier.pricing[0]?.reelCount || ""}
              onChange={(e) => handlePricingChange(idx, "reelCount", e.target.value)}
              className="border px-3 py-1 rounded"
              placeholder="Reel Count"
            />
            <input
              type="number"
              value={tier.pricing[0]?.priceMin || ""}
              onChange={(e) => handlePricingChange(idx, "priceMin", e.target.value)}
              className="border px-3 py-1 rounded"
              placeholder="Price Min"
            />
            <input
              type="number"
              value={tier.pricing[0]?.priceMax || ""}
              onChange={(e) => handlePricingChange(idx, "priceMax", e.target.value)}
              className="border px-3 py-1 rounded"
              placeholder="Price Max"
            />
          </div>
        </div>
      ))}

      {/* What's Included */}
      {/* What's Included */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-roseclub-accent mb-2">What's Included</h3>

        <div className="flex flex-wrap gap-2 mb-2">
          {whatsIncluded.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm"
            >
              {item}
              <X
                className="w-4 h-4 cursor-pointer"
                onClick={() => {
                  setWhatsIncluded((prev) => prev.filter((i) => i !== item));
                }}
              />
            </span>
          ))}
        </div>

        <input
          type="text"
          placeholder="Add item and press Enter"
          className="w-full border px-3 py-1 rounded"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const value = e.target.value.trim();
              if (value && !whatsIncluded.includes(value)) {
                setWhatsIncluded((prev) => [...prev, value]);
              }
              e.target.value = "";
            }
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-roseclub-accent text-white px-5 py-2 rounded hover:bg-roseclub-dark disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save Structure"}
      </button>
    </div>
  );
};

export default AdminEditEditorPortfolioStructure;
