const calculateTrustScore = (employee) => {
  let trustScore = 0;

  // ---------------- Resume Evidence (35) ----------------
  const resumeSkills =
    employee.matchedSkills?.filter(
      (skill) => skill.source === "resume"
    ).length || 0;

  if (resumeSkills > 0) {
    trustScore += 35;
  }

  // ---------------- Experience (20) ----------------
  let avgExperience = 0;

  if (employee.matchedSkills && employee.matchedSkills.length > 0) {
    avgExperience =
      employee.matchedSkills.reduce(
        (sum, skill) => sum + (skill.yearsOfExperience || 0),
        0
      ) / employee.matchedSkills.length;
  }

  if (avgExperience >= 8) trustScore += 20;
  else if (avgExperience >= 5) trustScore += 16;
  else if (avgExperience >= 3) trustScore += 12;
  else if (avgExperience >= 1) trustScore += 8;
  else trustScore += 4;

  // ---------------- Proficiency (15) ----------------

  const proficiencyMap = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

  let avgProficiency = 0;

  if (employee.matchedSkills && employee.matchedSkills.length > 0) {
    avgProficiency =
      employee.matchedSkills.reduce(
        (sum, skill) =>
          sum +
          (proficiencyMap[
            (skill.proficiencyLevel || "").toLowerCase()
          ] || 1),
        0
      ) / employee.matchedSkills.length;
  }

  if (avgProficiency >= 4) trustScore += 15;
  else if (avgProficiency >= 3) trustScore += 12;
  else if (avgProficiency >= 2) trustScore += 8;
  else trustScore += 4;

  // ---------------- Certifications (15) ----------------

  const certCount = employee.certifications?.length || 0;

  if (certCount >= 5) trustScore += 15;
  else if (certCount >= 3) trustScore += 12;
  else if (certCount >= 1) trustScore += 8;

  // ---------------- Endorsements (15) ----------------

  const endorsementCount =
    employee.matchedSkills?.reduce(
      (sum, skill) => sum + (skill.endorsementCount || 0),
      0
    ) || 0;

  if (endorsementCount >= 10) trustScore += 15;
  else if (endorsementCount >= 5) trustScore += 12;
  else if (endorsementCount >= 2) trustScore += 8;
  else if (endorsementCount >= 1) trustScore += 5;

  // ---------------- Final Score ----------------

  trustScore = Math.min(Math.round(trustScore), 100);

  return trustScore;
};

module.exports = calculateTrustScore;