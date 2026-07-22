import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Resume.css";

const Resume = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadResume = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please choose a resume.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setError("");
      setData(null);

      const res = await API.post(
        "/resume/parse-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data.parsedData);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Resume parsing failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-page">
      <div className="upload-card">
        <h2>📄 Resume Parser</h2>

        <p>
          Upload your PDF or DOCX resume to
          automatically extract candidate
          information.
        </p>

        {error && (
          <div
            className="alert alert-danger"
            style={{
              borderRadius: "12px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={uploadResume}>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setData(null);
              setError("");
            }}
          />

          {file && (
            <p
              style={{
                color: "var(--text)",
                fontSize: "14px",
                marginTop: "10px",
              }}
            >
              📎 Selected File:{" "}
              <strong>{file.name}</strong>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "⏳ Parsing..."
              : "🚀 Parse Resume"}
          </button>
        </form>

        <div
          style={{
            marginTop: "20px",
            fontSize: "13px",
            color: "var(--text)",
          }}
        >
          <strong>
            Supported Formats:
          </strong>{" "}
          PDF, DOC, DOCX
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
            <p>
              {data.experience ||
                "Not found"}
            </p>
          </div>

          <div className="row">
            <span>🛠 Skills</span>

            <p>
              {data.skills?.length
                ? data.skills.join(", ")
                : "No skills detected"}
            </p>
          </div>

          <div
            className="row"
            style={{
              borderBottom: "none",
            }}
          >
            <span>
              📊 Total Skills
            </span>

            <p>
              <strong>
                {data.skills?.length || 0}
              </strong>{" "}
              skills extracted
            </p>
          </div>

          {data.skills?.length > 0 && (
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent:
                  "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() =>
                  alert(
                    "Automatic skill import will be added in a future update."
                  )
                }
                style={{
                  background:
                    "linear-gradient(135deg,#7c3aed,#a78bfa)",
                  color: "#fff",
                  border: "none",
                  padding:
                    "10px 28px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                ➕ Add Skills to
                Profile
              </button>

              <button
                onClick={() =>
                  navigate("/skills")
                }
                style={{
                  background:
                    "transparent",
                  color: "#7c3aed",
                  border:
                    "2px solid #7c3aed",
                  padding:
                    "10px 28px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                View Skills
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Resume;