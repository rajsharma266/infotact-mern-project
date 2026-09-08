import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function InvitePage() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/workspaces/invite/${token}`
        );

        setWorkspace(res.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load invite details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInviteDetails();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading invite...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }
const handleJoin = async () => {
  const authToken = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // User not logged in
  if (!authToken) {
    localStorage.setItem("pendingInviteToken", token || "");
    navigate("/login");
    return;
  }

  if (!user._id) {
    alert("User information missing. Please login again.");
    navigate("/login");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:4000/api/workspaces/join",
      {
        token,
        userId: user._id,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    alert(res.data.message);
    navigate("/dashboard");
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to join workspace");
  }
};
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden select-none">
      {/* Decorative premium dark/neon background glows */}
      <div className="absolute top-[-250px] left-[-250px] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-250px] right-[-250px] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-950/70 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-[0_0_50px_-12px_rgba(124,58,237,0.15)] p-8 relative z-10">
        <h1 className="text-2xl font-black text-white text-center mb-6 tracking-tight">
          Workspace Invitation
        </h1>

        <p className="text-center text-zinc-400 text-sm mb-6 font-medium">
          You have been invited to join:
        </p>

        <div className="bg-black/60 border border-zinc-800/80 rounded-xl p-6">
          <h2 className="text-xl font-bold text-violet-400 text-center mb-4">
            {workspace?.name}
          </h2>

          <div className="space-y-3">
            <p className="text-zinc-300 text-sm text-center">
              <span className="font-semibold text-white">Owner:</span>{" "}
              {workspace?.owner?.name}
            </p>

            <p className="text-zinc-300 text-sm text-center">
              <span className="font-semibold text-white">Members:</span>{" "}
              {workspace?.members?.length}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleJoin}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition cursor-pointer text-sm"
          >
            Join Workspace
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-semibold transition cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvitePage;