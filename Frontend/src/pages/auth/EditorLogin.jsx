import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import API from "../../constants/api";
import axiosInstance from "../../api/axios"; // ✅ use centralized instance
import { handleTokenFallback } from "../../../utils/tokenFallback";
import { Eye, EyeOff } from "lucide-react"; // 👁️ icons

const EditorLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(API.EDITOR_LOGIN, { username, password });
      login(res.data.user);
      await handleTokenFallback(res.data.token);
      toast.success("🎉 Login successful");
      navigate("/chat");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Editor Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full px-4 py-2 border rounded-md"
        />

        {/* Password field with eye toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="w-full bg-roseclub-accent text-white py-2 rounded-md">
          Login
        </button>
        <p className="text-sm text-center mt-2">
          <span className="text-roseclub-accent cursor-pointer underline" onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </span>
        </p>
      </form>
    </div>
  );
};

export default EditorLogin;
