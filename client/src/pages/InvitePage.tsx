import { useNavigate } from "react-router-dom";

function InvitePage() {
  const navigate = useNavigate();

  // Later these values will come from backend
  const workspace = {
    name: "TechNova Workspace",
    owner: { name: "Raj Kumar" },
    members: [1, 2, 3, 4, 5, 6, 7, 8],
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Workspace Invitation
        </h1>

        <p className="text-center text-slate-400 mb-6">
          You have been invited to join:
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-bold text-indigo-400 text-center">
            {workspace.name}
          </h2>

          <p className="text-sm text-slate-300 text-center">
            Owner: {workspace.owner.name}
          </p>

          <p className="text-sm text-slate-300 text-center">
            Members: {workspace.members.length}
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-semibold transition"
          >
            Join Workspace
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvitePage;