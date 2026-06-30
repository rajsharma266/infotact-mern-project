import { useState, useEffect, type FormEvent } from "react";
import AuthInput from "./AuthInput";
import PasswordInput from "./PasswordInput";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignupForm() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If already logged in, redirect directly to dashboard
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const passwordsMatch =
        confirmPassword.length > 0 &&
        password === confirmPassword;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!hasLength || !hasUppercase || !hasNumber || !hasSpecial) {
            setError("Password does not meet all complexity requirements.");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("http://localhost:4000/api/users/register", {
                name,
                email,
                password,
            });

            if (response.data.success) {
                // Store the returned token and user details for automatic login
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
                setError(response.data.message || "Registration failed");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to register. Please try again."
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
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
            />

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
                <label className="block text-sm text-slate-300 mb-2">
                    Password
                </label>

                <PasswordInput
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
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
                    disabled={loading}
                />

                {confirmPassword.length > 0 && (
                    <p
                        className={`mt-2 text-xs ${passwordsMatch
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
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Creating Account...
                    </>
                ) : (
                    "Create Account"
                )}
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
                disabled={loading}
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
