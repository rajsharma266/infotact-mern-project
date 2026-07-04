import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import { FcGoogle } from "react-icons/fc";
import AuthInput from "./AuthInput";
import axios from "axios";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect directly to dashboard
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:4000/api/users/login", {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));

        // Check if there is a pending workspace invitation
        const pendingInviteToken = localStorage.getItem("pendingInviteToken");
        if (pendingInviteToken) {
          localStorage.removeItem("pendingInviteToken");
          navigate(`/invite/${pendingInviteToken}`);
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Could not connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-red-950/50 border border-red-500/50 text-red-200 text-sm rounded-lg flex items-center gap-2">
          <span className="text-red-400 font-semibold">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <AuthInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />
      <div>
        <label className="block text-sm text-zinc-300 mb-2">
          Password
        </label>

        <PasswordInput
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            className="accent-violet-600"
            disabled={loading}
          />
          Remember me
        </label>

        <button
          type="button"
          className="text-violet-400 hover:text-violet-300 transition"
          disabled={loading}
        >
          Forgot Password?
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-950 px-3 text-zinc-500">
            Or continue with
          </span>
        </div>
      </div>
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 text-white py-3 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition"
        disabled={loading}
      >
        <FcGoogle size={22} />
        Continue with Google
      </button>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </button>

      <div className="text-center text-sm text-zinc-400">
        Don't have an account?
        <Link
          to="/signup"
          className="ml-2 text-violet-400 hover:text-violet-300 font-medium"
        >
          Sign Up
        </Link>
      </div>
    </form>
  );
}
