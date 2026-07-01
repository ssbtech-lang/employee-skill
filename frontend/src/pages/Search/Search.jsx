import { useState } from "react";
import API from "../../services/api";
import "./Search.css";

function Search() {
  const [filter, setFilter] = useState({
    skill: "",
    minYears: "",
    proficiencyLevel: ""
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const params = {};
      if (filter.skill) params.skill = filter.skill;
      if (filter.minYears) params.minYears = filter.minYears;
      if (filter.proficiencyLevel) params.proficiencyLevel = filter.proficiencyLevel;

      const res = await API.get("/search/employees", { params });
      setResults(res.data.results || res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Search failed. Make sure you have the right role.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <h2>🔍 Search Employees</h2>
      <p className="subtitle">Find talent by skill, experience, and proficiency</p>

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
        <button type="submit" className="btn-search" disabled={loading}>
          {loading ? "Searching..." : "🔎 Search"}
        </button>
      </form>

      {searched && results.length === 0 && !loading && (
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
              <h3>👤 {item.employee?.name || item.user?.name || "Employee"}</h3>
              <p style={{ color: "var(--text)", fontSize: "14px" }}>
                {item.employee?.email || item.user?.email || ""}
              </p>
              <div className="info-row">
                <span>🏢 Role</span>
                <span><strong>{item.employee?.role || item.user?.role || "-"}</strong></span>
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