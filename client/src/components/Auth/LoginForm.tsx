export default function LoginForm() {
  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 mb-4"
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 mb-4"
      />

      <button
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg"
      >
        Login
      </button>
    </div>
  );
}