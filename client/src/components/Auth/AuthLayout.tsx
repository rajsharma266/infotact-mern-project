type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            TechNova
          </h1>
          <p className="text-slate-400 mt-2">
            Welcome back to your workspace
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}