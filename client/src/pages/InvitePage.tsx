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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading invite...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Workspace Invitation
        </h1>

        <p className="text-center text-slate-400 mb-6">
          You have been invited to join:
        </p>

        <div className="bg-black border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-indigo-400 text-center mb-4">
            {workspace?.name}
          </h2>

          <div className="space-y-3">
            <p className="text-slate-300 text-center">
              <span className="font-semibold text-white">Owner:</span>{" "}
              {workspace?.owner?.name}
            </p>

            <p className="text-slate-300 text-center">
              <span className="font-semibold text-white">Members:</span>{" "}
              {workspace?.members?.length}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleJoin}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer"
          >
            Join Workspace
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvitePage;