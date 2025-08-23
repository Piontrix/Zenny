import useAnalytics from "./hooks/useAnalytics";

const AnalyticsWrapper = () => {
  useAnalytics(); // now inside Router
  return null; // renders nothing
};

export default AnalyticsWrapper;
