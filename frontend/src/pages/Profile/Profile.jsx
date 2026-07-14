import { useState, useEffect } from "react";
import API from "../../services/api";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    department: "",
    designation: "",
    location: "",
    careerInterests: "",
    education: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile");
      if (res.data) {
        setProfile({
          department: res.data.department || "",
          designation: res.data.designation || "",
          location: res.data.location || "",
          careerInterests: res.data.careerInterests || "",
          education: res.data.education || ""
        });
        setHasProfile(true);
      }
    } catch (err) {
      // No profile exists yet, that's fine
      setHasProfile(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("/profile", profile);
      setMessage(res.data.message || "Profile saved successfully!");
      setIsError(false);
      setHasProfile(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save profile");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>👤 {hasProfile ? "Update Profile" : "Create Profile"}</h2>
        <p className="subtitle">Tell us about yourself</p>

        {message && (
          <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`} style={{ borderRadius: "12px" }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="department"
            placeholder="🏢 Department"
            value={profile.department}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="designation"
            placeholder="💼 Designation"
            value={profile.designation}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder="📍 Location"
            value={profile.location}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="careerInterests"
            placeholder="🎯 Career Interests (comma separated)"
            value={profile.careerInterests}
            onChange={handleChange}
            required
          />
          <textarea
            rows="3"
            name="education"
            placeholder="🎓 Education (comma separated)"
            value={profile.education}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : hasProfile ? "💾 Update Profile" : "💾 Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;