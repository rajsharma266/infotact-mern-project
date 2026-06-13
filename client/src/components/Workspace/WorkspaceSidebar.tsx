function WorkspaceSidebar() {
  const workspaces = ["T", "D", "H"];

  return (
    <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4">
      {workspaces.map((workspace, index) => (
        <div
          key={index}
          className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold cursor-pointer hover:bg-blue-500 transition"
        >
          {workspace}
        </div>
      ))}

      <button className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 text-xl">
        +
      </button>
    </div>
  );
}

export default WorkspaceSidebar;