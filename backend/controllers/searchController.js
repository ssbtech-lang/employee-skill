const Skill = require("../models/Skill");

const levelScore = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const searchEmployees = async (req, res) => {
  try {
    const { skill, minYears, proficiencyLevel } = req.query;

    const filter = {};

    if (skill) {
      filter.skillName = {
        $regex: skill,
        $options: "i",
      };
    }

    if (minYears) {
      filter.yearsOfExperience = {
        $gte: Number(minYears),
      };
    }

    if (proficiencyLevel) {
      filter.proficiencyLevel = proficiencyLevel;
    }

    const skills = await Skill.find(filter)
      .populate("userId", "name email role");

    const results = skills.map((s) => {
      let score = 0;

      score += levelScore[s.proficiencyLevel] || 0;
      score += s.yearsOfExperience || 0;
      score += s.endorsementCount || 0;

      if (s.source === "resume") score += 2;
      if (s.source === "endorsed") score += 3;

      return {
        employee: s.userId,
        matchedSkill: {
          skillName: s.skillName,
          category: s.category,
          proficiencyLevel: s.proficiencyLevel,
          yearsOfExperience: s.yearsOfExperience,
          source: s.source,
          endorsementCount: s.endorsementCount,
        },
        matchScore: score,
      };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  searchEmployees,
};