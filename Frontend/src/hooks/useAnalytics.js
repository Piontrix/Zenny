import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = "G-PNKCHGM9N1"; // your GA Measurement ID

export default function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", GA_ID, {
        page_path: location.pathname + location.search,
      });
      // Optional: log to console for debugging
      console.log("📊 GA Page View:", location.pathname + location.search);
    }
  }, [location]);
}
