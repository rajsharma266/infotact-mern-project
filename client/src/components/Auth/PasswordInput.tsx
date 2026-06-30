import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type PasswordInputProps = {
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

export default function PasswordInput({
  placeholder,
  value,
  onChange,
  disabled,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-3 pr-12 rounded-lg bg-slate-800 text-white border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white disabled:opacity-50"
      >
        {showPassword ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
}