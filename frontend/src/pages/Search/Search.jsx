import { useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Search.css";

function Search() {
  const { user } = useAuth();
  const [filter, setFilter] = useState({
    skill: "",
    minYears: "",
    proficiencyLevel: ""
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Check if user has permission
    const allowedRoles = ["manager", "hr", "ld"];
    if (!allowedRoles.includes(user?.role)) {
      setError("❌ Access denied. Only Managers, HR, and L&D can search for employees.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const params = {};
      if (filter.skill) params.skill = filter.skill;
      if (filter.minYears) params.minYears = filter.minYears;
      if (filter.proficiencyLevel) params.proficiencyLevel = filter.proficiencyLevel;

      const res = await API.get("/search/employees", { params });
      setResults(res.data.results || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("❌ Access denied. You need Manager, HR, or L&D role to search.");
      } else {
        setError(err.response?.data?.message || "Search failed");
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <h2>🔍 Search Employees</h2>
      <p className="subtitle">Find talent by skill, experience, and proficiency</p>

      {user?.role && !["manager", "hr", "ld"].includes(user.role) && (
        <div className="alert alert-warning" style={{ 
          borderRadius: "12px", 
          padding: "15px",
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          color: "#78350f",
          marginBottom: "20px"
        }}>
          ⚠️ You are logged in as <strong>{user.role}</strong>. Only <strong>Managers, HR, and L&D</strong> can search for employees.
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ 
          borderRadius: "12px",
          padding: "15px",
          background: "#fee2e2",
          border: "1px solid #ef4444",
          color: "#991b1b",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          name="skill"
          placeholder="🔧 Skill (e.g., React, Python)"
          value={filter.skill}
          onChange={handleChange}
        />
        <input
          type="number"
          name="minYears"
          placeholder="📅 Min Years"
          value={filter.minYears}
          onChange={handleChange}
          min="0"
          step="0.5"
        />
        <select name="proficiencyLevel" value={filter.proficiencyLevel} onChange={handleChange}>
          <option value="">📊 All Levels</option>
          <option value="beginner">🟡 Beginner</option>
          <option value="intermediate">🔵 Intermediate</option>
          <option value="advanced">🟢 Advanced</option>
          <option value="expert">🟣 Expert</option>
        </select>
        <button type="submit" className="btn-search" disabled={loading || !["manager", "hr", "ld"].includes(user?.role)}>
          {loading ? "Searching..." : "🔎 Search"}
        </button>
      </form>

      {searched && results.length === 0 && !loading && !error && (
        <div className="no-results">
          <span className="icon">🔍</span>
          <h3>No employees found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-grid">
          {results.map((item, index) => (
            <div className="employee-card" key={index}>
              <h3>👤 {item.employee?.name || "Employee"}</h3>
              <p style={{ color: "var(--text)", fontSize: "14px" }}>
                {item.employee?.email || ""}
              </p>
              <div className="info-row">
                <span>🏢 Role</span>
                <span><strong>{item.employee?.role || "-"}</strong></span>
              </div>
              <div className="info-row">
                <span>🏛️ Department</span>
                <span>{item.profile?.department || "-"}</span>
              </div>
              <div className="info-row">
                <span>💼 Designation</span>
                <span>{item.profile?.designation || "-"}</span>
              </div>
              <div className="info-row">
                <span>📍 Location</span>
                <span>{item.profile?.location || "-"}</span>
              </div>

              {item.skills && item.skills.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <strong>Skills:</strong>
                  <div>
                    {item.skills.slice(0, 3).map((skill, idx) => (
                      <span className="skill-tag" key={idx}>
                        {skill.skillName} ({skill.proficiencyLevel})
                      </span>
                    ))}
                    {item.skills.length > 3 && (
                      <span className="skill-tag">+{item.skills.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              <div className="match-score">
                🏆 Match Score: {item.matchScore || 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;