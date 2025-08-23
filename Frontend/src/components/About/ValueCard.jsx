import React from "react";

const ValueCard = ({ title, description, dark = false }) => {
  return (
    <div
      className={`rounded-xl p-6 shadow-md border-l-4 ${
        dark ? "bg-white/10 text-white border-white" : "bg-white/60 text-roseclub-dark border-roseclub-accent"
      }`}
    >
      <h3 className="font-semibold mb-1">{title}</h3>
      <div className="text-sm">{description}</div>
    </div>
  );
};

export default ValueCard;
