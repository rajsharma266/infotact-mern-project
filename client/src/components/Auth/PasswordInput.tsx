import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type PasswordInputProps = {
  name?: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
};

export default function PasswordInput({
  name,
  placeholder,
  value,
  onChange,
  autoComplete,
  required = false,
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className="w-full p-3 pr-12 rounded-lg bg-slate-800 text-white border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
      >
        {showPassword ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
}
