import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Resume.css";

const Resume = () => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadResume = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please choose a resume");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        "http://localhost:5000/api/resume/parse-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Resume parsing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-page">
      <div className="upload-card">
        <h2>📄 Resume Parser</h2>
        <p>Upload a PDF or DOCX resume to extract candidate details.</p>

        {error && (
          <div className="alert alert-danger" style={{ borderRadius: "12px", marginBottom: "15px" }}>
            {error}
          </div>
        )}

        <form onSubmit={uploadResume}>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && (
            <p style={{ color: "var(--text)", fontSize: "14px", marginTop: "10px" }}>
              📎 Selected: {file.name}
            </p>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "⏳ Parsing..." : "🚀 Parse Resume"}
          </button>
        </form>

        <div style={{ marginTop: "20px", fontSize: "13px", color: "var(--text)" }}>
          <strong>Supported formats:</strong> PDF, DOCX
        </div>
      </div>

      {data && (
        <div className="result-card">
          <h2>📋 Resume Details</h2>

          <div className="row">
            <span>👤 Name</span>
            <p>{data.name || "Not found"}</p>
          </div>

          <div className="row">
            <span>📧 Email</span>
            <p>{data.email || "Not found"}</p>
          </div>

          <div className="row">
            <span>📱 Phone</span>
            <p>{data.phone || "Not found"}</p>
          </div>

          <div className="row">
            <span>💼 Experience</span>
            <p>{data.experience || "Not found"}</p>
          </div>

          <div className="row">
            <span>🛠️ Skills</span>
            <p>
              {data.skills && data.skills.length > 0
                ? data.skills.join(", ")
                : "No skills found"}
            </p>
          </div>

          <div className="row" style={{ borderBottom: "none" }}>
            <span>📊 Total Skills</span>
            <p><strong>{data.skills?.length || 0}</strong> skills extracted</p>
          </div>

          {data.skills && data.skills.length > 0 && (
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <button 
                onClick={() => alert("Add these skills to your profile!")}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  color: "white",
                  border: "none",
                  padding: "10px 30px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                ➕ Add Skills to Profile
              </button>
              <button
                onClick={() => window.location.href = "/skills"}
                style={{
                  background: "transparent",
                  color: "#7c3aed",
                  border: "2px solid #7c3aed",
                  padding: "10px 30px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginLeft: "10px"
                }}
              >
                Go to Skills
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Resume;