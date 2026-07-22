import { useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Search.css";

function Search() {
  const { user } = useAuth();

  const [filter, setFilter] = useState({
    skills: "",
    department: "",
    designation: "",
    location: "",
    education: "",
    certification: "",
    minExperience: "",
    maxExperience: "",
    minProficiency: "",
    matchMode: "any",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const allowedRoles = ["manager", "hr"];

    if (!allowedRoles.includes(user?.role)) {
      setError(
        "❌ Access denied. Only Managers, HR and L&D can search."
      );
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const params = {};

      Object.keys(filter).forEach((key) => {
        if (filter[key] !== "") {
          params[key] = filter[key];
        }
      });

      const res = await API.get("/search/advanced", {
        params,
      });

      setResults(res.data.results || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError(
          "❌ You don't have permission to search employees."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Search failed"
        );
      }

      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <h2>🔍 Advanced Employee Search</h2>

      <p className="subtitle">
        Search employees by skills, department,
        certifications and experience
      </p>

      {user?.role &&
        !["manager", "hr", "ld"].includes(user.role) && (
          <div className="alert alert-warning">
            ⚠️ Only Managers, HR and L&D can
            perform employee searches.
          </div>
        )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <form
        className="search-form"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          name="skills"
          placeholder="Skills (React, Java, Python)"
          value={filter.skills}
          onChange={handleChange}
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          value={filter.department}
          onChange={handleChange}
        />

        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={filter.designation}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filter.location}
          onChange={handleChange}
        />

        <input
          type="text"
          name="education"
          placeholder="Education"
          value={filter.education}
          onChange={handleChange}
        />

        <input
          type="text"
          name="certification"
          placeholder="Certification"
          value={filter.certification}
          onChange={handleChange}
        />

        <input
          type="number"
          name="minExperience"
          placeholder="Min Experience"
          value={filter.minExperience}
          onChange={handleChange}
          min="0"
        />

        <input
          type="number"
          name="maxExperience"
          placeholder="Max Experience"
          value={filter.maxExperience}
          onChange={handleChange}
          min="0"
        />

        <select
          name="minProficiency"
          value={filter.minProficiency}
          onChange={handleChange}
        >
          <option value="">
            Minimum Proficiency
          </option>
          <option value="beginner">
            Beginner
          </option>
          <option value="intermediate">
            Intermediate
          </option>
          <option value="advanced">
            Advanced
          </option>
          <option value="expert">
            Expert
          </option>
        </select>

        <select
          name="matchMode"
          value={filter.matchMode}
          onChange={handleChange}
        >
          <option value="any">
            Match Any Skill
          </option>
          <option value="all">
            Match All Skills
          </option>
        </select>

        <button
          type="submit"
          className="btn-search"
          disabled={
            loading ||
            !["manager", "hr", "ld"].includes(
              user?.role
            )
          }
        >
          {loading
            ? "Searching..."
            : "🔍 Search"}
        </button>
      </form>
            {searched &&
        results.length === 0 &&
        !loading &&
        !error && (
          <div className="no-results">
            <span className="icon">🔍</span>
            <h3>No Employees Found</h3>
            <p>
              Try changing the search filters.
            </p>
          </div>
        )}

      {results.length > 0 && (
        <div className="results-grid">
          {results.map((item, index) => (
            <div
              className="employee-card"
              key={index}
            >
              <h3>
                👤{" "}
                {item.employee?.name ||
                  "Employee"}
              </h3>

              <p className="email">
                {item.employee?.email}
              </p>

              <div className="info-row">
                <span>🏢 Department</span>
                <span>
                  {item.profile?.department ||
                    "-"}
                </span>
              </div>

              <div className="info-row">
                <span>💼 Designation</span>
                <span>
                  {item.profile?.designation ||
                    "-"}
                </span>
              </div>

              <div className="info-row">
                <span>📍 Location</span>
                <span>
                  {item.profile?.location ||
                    "-"}
                </span>
              </div>

              <div className="info-row">
                <span>🎓 Education</span>
                <span>
                  {item.profile?.education ||
                    "-"}
                </span>
              </div>

              <div className="match-score">
                🏆 Match Score :
                <strong>
                  {" "}
                  {item.matchScore}
                </strong>
              </div>
              <div className="match-score">
                🛡️ Trust Score :
                <strong>{item.trustScore}/100</strong>
                </div>


              {item.matchPercentage !== null && (
                <div className="match-score">
                  🎯 Match Percentage :
                  <strong>
                    {" "}
                    {item.matchPercentage}%
                  </strong>
                </div>
              )}

              <div
                style={{
                  marginTop: "15px",
                }}
              >
                <strong>
                  ✅ Matched Skills
                </strong>

                <div
                  style={{
                    marginTop: "8px",
                  }}
                >
                  {item.matchedSkills?.length >
                  0 ? (
                    item.matchedSkills.map(
                      (skill) => (
                        <span
                          key={skill._id}
                          className="skill-tag"
                        >
                          {skill.skillName}
                          {" ("}
                          {
                            skill.proficiencyLevel
                          }
                          {")"}
                        </span>
                      )
                    )
                  ) : (
                    <p>No matching skills</p>
                  )}
                </div>
              </div>

              {item.certifications?.length >
                0 && (
                <div
                  style={{
                    marginTop: "15px",
                  }}
                >
                  <strong>
                    📜 Certifications
                  </strong>

                  <div
                    style={{
                      marginTop: "8px",
                    }}
                  >
                    {item.certifications.map(
                      (cert, idx) => (
                        <span
                          key={idx}
                          className="skill-tag"
                        >
                          {
                            cert.certificationName
                          }
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {item.scoreBreakdown && (
                <div
                  style={{
                    marginTop: "15px",
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  <strong>
                    Score Breakdown
                  </strong>

                  <p>
                    Skill Score :{" "}
                    {
                      item.scoreBreakdown
                        .skillScore
                    }
                  </p>

                  <p>
                    Coverage Bonus :{" "}
                    {
                      item.scoreBreakdown
                        .skillCoverageBonus
                    }
                  </p>

                  <p>
                    Certification Bonus :{" "}
                    {
                      item.scoreBreakdown
                        .certificationBonus
                    }
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;