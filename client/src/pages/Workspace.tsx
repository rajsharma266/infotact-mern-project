import WorkspaceSidebar from "../components/Workspace/WorkspaceSidebar";
import ChannelList from "../components/Workspace/ChannelList";

function Workspace() {
  return (
    <div className="flex h-screen">
      <WorkspaceSidebar />
      <ChannelList />

      <div className="flex-1 p-4">
        Chat Area
      </div>
    </div>
  );
}

export default Workspace;