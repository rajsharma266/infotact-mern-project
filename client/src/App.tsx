import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Workspace from "./pages/Workspace";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />
      
      <Route path="/workspace" element={<Workspace />} />
    </Routes>
  );
}

export default App;