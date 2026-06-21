import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WorkspaceApp from "./pages/WorkspaceApp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={<WorkspaceApp initialView="dashboard" />}
      />
      <Route
        path="/workspace"
        element={<WorkspaceApp initialView="workspace" />}
      />
      <Route
        path="/workspaceapp"
        element={<WorkspaceApp initialView="dashboard" />}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
