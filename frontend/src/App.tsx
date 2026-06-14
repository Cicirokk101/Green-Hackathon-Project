import { Route, Routes } from "react-router-dom";
import { TopNav } from "./components/layout/TopNav";
import { K } from "./lib/karma";
import { CommunityPage } from "./pages/CommunityPage";
import Profile from "./pages/Profile";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { StartPage } from "./pages/StartPage";
import { HostWorkshopPage } from "./pages/HostWorkshopPage";

function App() {
  return (
    <div style={{ minHeight: "100vh", background: K.paper }}>
      <TopNav />
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/host-workshop" element={<HostWorkshopPage />} />
      </Routes>
    </div>
  );
}

export default App;
