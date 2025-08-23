import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axios";
import API from "../constants/api";
import toast from "react-hot-toast";
import LoaderSpinner from "../components/common/LoaderSpinner";
import { Link } from "react-router-dom";
import PaymentModal from "../components/Payment/PaymentModal";

const EditorPortfolioCard = ({ editor }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    plan: null,
    amount: null,
  });

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
      toast.error("Failed to start chat. Please Try Again after Some Time");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = async (plan, amount) => {
    if (!user || user.role !== "creator") {
      toast.error("Only creators can make payments");
      return;
    }

    try {
      const { data } = await axiosInstance.get(API.GET_EDITOR_BY_ID(editor._id));
      if (!data?.data) {
        toast.error("This editor is no longer available");
        return;
      }

      setPaymentModal({
        isOpen: true,
        plan,
        amount,
      });
    } catch (err) {
      console.error("Editor check failed:", err);
      toast.error("Editor not found or deleted");
    }
  };

  const closePaymentModal = () => {
    setPaymentModal({
      isOpen: false,
      plan: null,
      amount: null,
    });
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

                <div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-roseclub-accent">{formatPrice(tier.pricing)}</span>
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error("Please login or register to avail service");
                        return;
                      } else if (user.role !== "creator") {
                        toast.error("Please login or register as Creator to avail service");
                        return;
                      }
                      handlePaymentClick(tier.title, tier.pricing[0].priceMin);
                    }}
                    className="w-full mt-3 px-4 py-2 bg-roseclub-accent text-white rounded-lg hover:bg-roseclub-dark transition font-semibold"
                  >
                    Pay ₹{tier.pricing[0].priceMin}
                  </button>
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

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={closePaymentModal}
          editor={editor}
          plan={paymentModal.plan}
          amount={paymentModal.amount}
        />
      )}

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
                    <video src={selectedTier.sample.url} controls className="w-full h-full object-contain rounded-lg" />
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
  );
};

export default EditorPortfolioCard;
