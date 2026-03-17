import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Alerts from "./pages/Alerts.jsx";
import Activities from "./pages/Activities.jsx";
import Investigation from "./pages/Investigation.jsx";
import Login from "./pages/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px", background: "#f5f6fa" }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/investigation" element={<Investigation />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
