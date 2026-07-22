import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      logout();
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
  <div className="dashboard">
    <div className="dashboard-header">
      <h2>✨ Skill Discovery Platform</h2>
    </div>

    {user && (
      <div className="profile-card">
        <h3>👋 Welcome, {user.name}!</h3>
        <p><strong>📧 Email:</strong> {user.email}</p>
        <p>
          <strong>🎯 Role:</strong>{" "}
          <span className="badge-role">
            {user.role.toUpperCase()}
          </span>
        </p>
      </div>
    )}

    <div className="dashboard-cards">

      {/* Everyone */}
      <div className="card-box" onClick={() => navigate("/profile")}>
        <span className="icon">👤</span>
        <h3>My Profile</h3>
        <p>Create or update your profile</p>
      </div>

      {/* Everyone */}
      <div className="card-box" onClick={() => navigate("/skills")}>
        <span className="icon">⚡</span>
        <h3>My Skills</h3>
        <p>Manage your skills</p>
      </div>

      {/* Everyone */}
      <div className="card-box" onClick={() => navigate("/resume")}>
        <span className="icon">📄</span>
        <h3>Resume Parser</h3>
        <p>Upload and parse your resume</p>
      </div>

      {/* Only Manager, HR and L&D */}
      {["manager", "hr", "ld"].includes(user?.role) && (
        <div className="card-box" onClick={() => navigate("/search")}>
          <span className="icon">🔍</span>
          <h3>Search Employees</h3>
          <p>Discover talent by skill</p>
        </div>
      )}

    </div>
  </div>
);
}

export default Dashboard;