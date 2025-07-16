import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true, // ✅ send cookies with every request
});

export default axiosInstance;
