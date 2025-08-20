import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import API from "../../constants/api";
import axiosInstance from "../../api/axios";
import { handleTokenFallback } from "../../../utils/tokenFallback";
import { Eye, EyeOff } from "lucide-react"; // 👁️ icons

const CreatorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post(API.CREATOR_LOGIN, { email, password });
      login(res.data.user);
      await handleTokenFallback(res.data.token);
      toast.success("🎉 Login successful");
      navigate("/");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Login failed. Try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 p-6 shadow-lg bg-white rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Creator Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />

        {/* Password with eye toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-roseclub-accent text-white py-2 rounded hover:bg-roseclub-dark"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>

      <p className="text-sm text-center mt-4">
        New here?{" "}
        <span className="text-roseclub-accent cursor-pointer underline" onClick={() => navigate("/register")}>
          Register
        </span>
      </p>
    </div>
  );
};

export default CreatorLogin;
