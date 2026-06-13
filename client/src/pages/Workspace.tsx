import WorkspaceSidebar from "../components/Workspace/WorkspaceSidebar";
import ChannelPanel from "../components/Workspace/ChannelPanel";
import ChatArea from "../components/Workspace/ChatArea";

function Workspace() {
  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <WorkspaceSidebar />
      <ChannelPanel />
      <ChatArea />
    </div>
  );
}

export default Workspace;