type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Decorative premium dark/neon background glows */}
      <div className="absolute top-[-250px] left-[-250px] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-250px] right-[-250px] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-950/70 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_-12px_rgba(124,58,237,0.15)] p-8 border border-zinc-800/80 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 tracking-tight">
            INFOTACT
          </h1>
          <p className="text-zinc-400 mt-2 text-sm font-medium">
            Welcome back to your workspace
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}