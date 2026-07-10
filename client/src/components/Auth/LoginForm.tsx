import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import { FcGoogle } from "react-icons/fc";
import AuthInput from "./AuthInput";
import ErrorMessage from "./ErrorMessage";
import {
  loginUser,
  saveSession,
  toApiErrorMessage,
  toUser,
} from "../../services/api";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const response = await loginUser({ email, password });
      saveSession(response.token, toUser(response.data));
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(toApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthInput
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
        disabled={isSubmitting}
      />
      <div>
        <label className="block text-sm text-slate-300 mb-2">
          Password
        </label>

        <PasswordInput
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          disabled={isSubmitting}
        />
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            className="accent-violet-600"
          />
          Remember me
        </label>

        <button
          type="button"
          className="text-violet-400 hover:text-violet-300 transition"
        >
          Forgot Password?
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-3 text-slate-500">
            Or continue with
          </span>
        </div>
      </div>
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 bg-slate-800 border border-slate-700 text-white py-3 rounded-lg hover:bg-slate-700 transition"
      >
        <FcGoogle size={22} />
        Continue with Google
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      <div className="text-center text-sm text-slate-400">
        Don't have an account?
        <Link
          to="/register"
          className="ml-2 text-violet-400 hover:text-violet-300 font-medium"
        >
          Sign Up
        </Link>
      </div>
    </form>
  );
}
