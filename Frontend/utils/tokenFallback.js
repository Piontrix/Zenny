import axiosInstance from "../src/api/axios";

export const handleTokenFallback = async (token) => {
	try {
		await axiosInstance.get("/me");
	} catch (err) {
		// Cookie failed → fallback to Authorization
		if (token) {
			localStorage.setItem("token", token);
			console.warn("⚠️ Cookie blocked — token saved to localStorage");
		}
	}
};
