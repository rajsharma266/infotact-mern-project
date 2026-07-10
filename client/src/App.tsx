import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WorkspaceApp from "./pages/WorkspaceApp";
import { hasToken } from "./services/api";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!hasToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const isAuthenticated = hasToken();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
        }
      />
      <Route path="/signup" element={<Navigate to="/register" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <WorkspaceApp initialView="dashboard" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/:id"
        element={
          <ProtectedRoute>
            <WorkspaceApp initialView="workspace" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/channel/:id"
        element={
          <ProtectedRoute>
            <WorkspaceApp initialView="workspace" />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
