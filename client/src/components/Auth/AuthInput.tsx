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
      <label className="block text-sm text-zinc-300 mb-2">
        {label}
      </label>

      <input
        {...props}
        className="w-full p-3 rounded-lg bg-black text-white border border-zinc-800 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition"
      />
    </div>
  );
}
