import PasswordInput from "./PasswordInput";
import { FcGoogle } from "react-icons/fc";
import AuthInput from "./AuthInput";


export default function LoginForm() {
  return (
    <form className="space-y-5">
      {/* Email */}
      <AuthInput
        label="Email"
        type="email"
        placeholder="Enter your email"
      />

      {/* Password */}
      <div>
        <label className="block text-sm text-slate-300 mb-2">
          Password
        </label>

        <PasswordInput placeholder="Enter your password" />
      </div>

      {/* Remember Me + Forgot Password */}
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

      {/* Divider */}
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

      {/* Google Login */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 bg-slate-800 border border-slate-700 text-white py-3 rounded-lg hover:bg-slate-700 transition"
      >
        <FcGoogle size={22} />
        Continue with Google
      </button>

      {/* Login Button */}
      <button
        type="submit"
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition"
      >
        Login
      </button>

      {/* Sign Up */}
      <div className="text-center text-sm text-slate-400">
        Don't have an account?
        <button
          type="button"
          className="ml-2 text-violet-400 hover:text-violet-300 font-medium transition"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
}