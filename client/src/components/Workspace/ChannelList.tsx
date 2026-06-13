function ChannelList() {
  const channels = ["general", "frontend", "backend", "ui-design"];

  return (
    <div className="p-4">
      <h3 className="text-slate-400 mb-3 uppercase text-sm">Channels</h3>

      <div className="space-y-2">
        {channels.map((channel) => (
          <div
            key={channel}
            className="px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition"
          >
            # {channel}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChannelList;