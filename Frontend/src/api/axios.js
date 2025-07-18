import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true, // try with cookie first
});

axiosInstance.interceptors.request.use((config) => {
	// If no cookies work, fallback to Bearer token
	const token = localStorage.getItem("token");
	if (token && !config.headers["Authorization"]) {
		config.headers["Authorization"] = `Bearer ${token}`;
	}
	return config;
});

export default axiosInstance;
