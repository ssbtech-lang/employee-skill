const PROFICIENCY_SCORES = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseSkills = (value) => {
  if (!value || typeof value !== "string") {
    return [];
  }

  return [
    ...new Set(
      value
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    ),
  ];
};

const getProficiencyScore = (level) => {
  if (!level || typeof level !== "string") {
    return 0;
  }

  return PROFICIENCY_SCORES[level.toLowerCase()] || 0;
};

const calculateSkillScore = (skill) => {
  const proficiencyScore = getProficiencyScore(
    skill.proficiencyLevel
  );

  const experienceScore =
    Number(skill.yearsOfExperience) || 0;

  const endorsementScore =
    Number(skill.endorsementCount) || 0;

  const resumeSourceScore =
    String(skill.source).toLowerCase() === "resume" ? 2 : 0;

  return (
    proficiencyScore +
    experienceScore +
    endorsementScore +
    resumeSourceScore
  );
};

module.exports = {
  PROFICIENCY_SCORES,
  escapeRegex,
  parseSkills,
  getProficiencyScore,
  calculateSkillScore,
};