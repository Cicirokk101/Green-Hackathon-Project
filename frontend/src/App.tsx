import { Route, Routes } from "react-router-dom";
import { TopNav } from "./components/layout/TopNav";
import { K } from "./lib/karma";
import { CommunityPage } from "./pages/CommunityPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { StartPage } from "./pages/StartPage";
import { StartWorkshopPage } from "./pages/StartWorkshopPage";

function App() {
  return (
    <div style={{ minHeight: "100vh", background: K.paper }}>
      <TopNav />
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/start-workshop" element={<StartWorkshopPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
