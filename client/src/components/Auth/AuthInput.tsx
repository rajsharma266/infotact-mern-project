type AuthInputProps = {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
};

export default function AuthInput({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  required = false,
  disabled = false,
}: AuthInputProps) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">
        {label}
      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}
