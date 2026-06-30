import type { InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function AuthInput({
  label,
  ...props
}: AuthInputProps) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">
        {label}
      </label>

      <input
        {...props}
        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}
