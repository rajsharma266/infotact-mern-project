import ChannelList from "./ChannelList";


function ChannelPanel() {
  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xl font-bold">TechNova</h2>
        <p className="text-sm text-slate-400">Workspace</p>
      </div>

      <ChannelList />
      
    </div>
  );
}

export default ChannelPanel;