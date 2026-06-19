type AuthInputProps = {
  label: string;
  type: string;
  placeholder: string;
};

export default function AuthInput({
  label,
  type,
  placeholder,
}: AuthInputProps) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}