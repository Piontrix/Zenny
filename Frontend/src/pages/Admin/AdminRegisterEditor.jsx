import { useState } from "react";
import API from "../../constants/api";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axios";
import LoaderSpinner from "../../components/common/LoaderSpinner";
import { Eye, EyeOff } from "lucide-react";

const AdminRegisterEditor = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loader state
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const payload = { username, password };
      if (email.trim()) payload.email = email.trim();

      const res = await axiosInstance.post(API.ADMIN_REGISTER_EDITOR, payload);

      setMessage(res.data.message);
      toast.success(res.data.message || "Editor registered successfully!");
      setUsername("");
      setPassword("");
      setEmail("");
    } catch (err) {
      const msg = err.response?.data?.message || "Editor registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Register New Editor</h2>

      <form onSubmit={handleSubmit} className="space-y-4 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-md">
            <LoaderSpinner />
          </div>
        )}

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full px-4 py-2 border rounded-md"
          required
        />

        {/* Password field with eye toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md pr-10"
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

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="(Optional) Editor Email"
          className="w-full px-4 py-2 border rounded-md"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-roseclub-accent text-white py-2 rounded-md disabled:opacity-50"
        >
          Register Editor
        </button>

        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default AdminRegisterEditor;
