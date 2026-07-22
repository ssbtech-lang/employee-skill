import { useEffect, useState } from "react";
import API from "../../services/api";
import "./Skills.css";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    skillName: "",
    category: "",
    proficiencyLevel: "beginner",
    yearsOfExperience: "",
    source: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await API.get("/skills");
      setSkills(res.data.skills || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

 const handleChange = (e) => {
  const value =
    e.target.type === "number"
      ? e.target.value === ""
        ? ""
        : parseFloat(e.target.value)
      : e.target.value;

  setFormData((prev) => ({
    ...prev,
    [e.target.name]: value,
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await API.put(`/skills/${editingId}`, formData);
        alert("✅ Skill Updated Successfully!");
      } else {
        await API.post("/skills", formData);
        alert("✅ Skill Added Successfully!");
      }

      setFormData({
        skillName: "",
        category: "",
        proficiencyLevel: "beginner",
        yearsOfExperience: "",
        source: "",
        // endorsementCount: 0,
      });
      setEditingId(null);
      fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const editSkill = (skill) => {
    setEditingId(skill._id);
    setFormData({
      skillName: skill.skillName,
      category: skill.category || "",
      proficiencyLevel: skill.proficiencyLevel || "beginner",
      yearsOfExperience: skill.yearsOfExperience || "",
      source: skill.source || "",
      // endorsementCount: skill.endorsementCount || 0,
    });
  };

  const deleteSkill = async (id) => {
    if (!window.confirm("🗑️ Delete this skill?")) return;

    try {
      await API.delete(`/skills/${id}`);
      fetchSkills();
      alert("✅ Skill Deleted!");
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      skillName: "",
      category: "",
      proficiencyLevel: "beginner",
      yearsOfExperience: "",
      source: "",
      // endorsementCount: 0,
    });
  };

  return (
    <div className="skills-page">
      <h2>⚡ My Skills</h2>
      <p className="subtitle">Showcase your expertise</p>

      <form className="skill-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="skillName"
          placeholder="Skill Name *"
          value={formData.skillName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        />
        <select name="proficiencyLevel" value={formData.proficiencyLevel} onChange={handleChange}>
          <option value="beginner">🟡 Beginner</option>
          <option value="intermediate">🔵 Intermediate</option>
          <option value="advanced">🟢 Advanced</option>
          <option value="expert">🟣 Expert</option>
        </select>
        <input
          type="number"
          name="yearsOfExperience"
          placeholder="Years"
          value={formData.yearsOfExperience}
          onChange={handleChange}
          min="0"
          step="0.5"
        />
        <input
          type="text"
          name="source"
          placeholder="Source"
          value={formData.source}
          onChange={handleChange}
        />
        {/* <input
          type="number"
          name="endorsementCount"
          placeholder="Endorsements"
          value={formData.endorsementCount}
          onChange={handleChange}
          min="0"
        /> */}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Saving..." : editingId ? "✏️ Update" : "➕ Add"}
        </button>
        {editingId && (
          <button type="button" className="btn-cancel" onClick={cancelEdit}>
            ❌ Cancel
          </button>
        )}
      </form>

      <div className="table-container">
        <table className="skills-table">
          <thead>
            <tr>
              <th>Skill</th>
              <th>Category</th>
              <th>Level</th>
              <th>Years</th>
              <th>Source</th>
              <th>⭐ Endorsements</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text)" }}>
                  No skills added yet. Start by adding one above! 🚀
                </td>
              </tr>
            ) : (
              skills.map((skill) => (
                <tr key={skill._id}>
                  <td><strong>{skill.skillName}</strong></td>
                  <td>{skill.category || "-"}</td>
                  <td>
                    <span className={`proficiency-badge ${skill.proficiencyLevel}`}>
                      {skill.proficiencyLevel}
                    </span>
                  </td>
                  <td>{skill.yearsOfExperience || 0}</td>
                  <td>{skill.source || "-"}</td>
                  <td>⭐ {skill.endorsementCount || 0}</td>
                  <td>
                    <button className="btn-edit" onClick={() => editSkill(skill)}>
                      ✏️ Edit
                    </button>
                    <button className="btn-delete" onClick={() => deleteSkill(skill._id)}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Skills;