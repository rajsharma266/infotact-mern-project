import { useState, type FormEvent } from "react";
import AuthInput from "./AuthInput";
import PasswordInput from "./PasswordInput";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";

export default function SignupForm() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const passwordsMatch =
        confirmPassword.length > 0 &&
        password === confirmPassword;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!passwordsMatch) {
        return;
      }

      navigate("/dashboard");
    };

    return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthInput
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
      />

      <AuthInput
        label="Email"
        type="email"
        placeholder="Enter your email"
      />

      <div>
        <label className="block text-sm text-slate-300 mb-2">
          Password
        </label>

        <PasswordInput
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="mt-3 space-y-1 text-xs">
          <p className={hasLength ? "text-green-400" : "text-slate-500"}>
            {hasLength ? "✓" : "○"} At least 8 characters
          </p>

          <p className={hasUppercase ? "text-green-400" : "text-slate-500"}>
            {hasUppercase ? "✓" : "○"} One uppercase letter
          </p>

          <p className={hasNumber ? "text-green-400" : "text-slate-500"}>
            {hasNumber ? "✓" : "○"} One number
          </p>
          <p className={hasSpecial ? "text-green-400" : "text-slate-500"}>
            {hasSpecial ? "✓" : "○"} One special character
          </p>
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-2">
          Confirm Password
        </label>

        <PasswordInput
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
        />

        {confirmPassword.length > 0 && (
          <p
            className={`mt-2 text-xs ${
              passwordsMatch
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {passwordsMatch
              ? "✓ Passwords match"
              : "✗ Passwords do not match"}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition"
      >
        Create Account
      </button>

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

      <div className="text-center text-sm text-slate-400">
        Already have an account?
        <Link
  to="/login"
  className="ml-2 text-violet-400 hover:text-violet-300 font-medium"
>
  Login
</Link>
      </div>
    </form >
  );
}
