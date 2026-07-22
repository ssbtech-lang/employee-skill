import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <nav style={{ 
        background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
        padding: "16px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "24px", fontWeight: "700" }}>
          ✨ SkillDiscovery
        </Link>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/login" style={{ color: "white", textDecoration: "none", padding: "8px 20px", border: "2px solid white", borderRadius: "10px" }}>
            Login
          </Link>
          <Link to="/register" style={{ color: "#7c3aed", textDecoration: "none", padding: "8px 20px", background: "white", borderRadius: "10px", fontWeight: "600" }}>
            Register
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav style={{ 
      background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
      padding: "12px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px"
    }}>
      <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "22px", fontWeight: "700" }}>
        ✨ SkillDiscovery
      </Link>
      
      <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
        {/* <Link to="/profile" style={{ color: "white", textDecoration: "none" }}>Profile</Link>
        <Link to="/skills" style={{ color: "white", textDecoration: "none" }}>Skills</Link>
        <Link to="/search" style={{ color: "white", textDecoration: "none" }}>Search</Link>
        <Link to="/resume" style={{ color: "white", textDecoration: "none" }}>📄 Resume</Link> */}
        <span style={{ color: "white", opacity: 0.8 }}>👋 {user?.name || "User"}</span>
        <button onClick={handleLogout} style={{ 
          padding: "8px 20px",
          background: "rgba(255,255,255,0.2)",
          color: "white",
          border: "2px solid white",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "600"
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;