import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TopNav } from "./components/layout/TopNav";
import { K } from "./lib/karma";
import { CommunityPage } from "./pages/CommunityPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import Profile from "./pages/Profile";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { StartPage } from "./pages/StartPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isLoading } = useAuth();
  if (isLoading) return null;

  return (
    <div style={{ minHeight: "100vh", background: K.paper }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/*"
          element={
            <>
              <TopNav />
              <Routes>
                <Route path="/" element={<ProjectsPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/start" element={<RequireAuth><StartPage /></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              </Routes>
            </>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
