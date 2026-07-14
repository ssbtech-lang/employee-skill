const Skill = require("../models/Skill");
const EmployeeProfile = require("../models/EmployeeProfile");

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

    // Group skills by userId
    const userSkillsMap = {};
    skills.forEach(skill => {
      const userId = skill.userId._id.toString();
      if (!userSkillsMap[userId]) {
        userSkillsMap[userId] = {
          user: skill.userId,
          skills: [],
          totalScore: 0
        };
      }
      
      let score = 0;
      score += levelScore[skill.proficiencyLevel] || 0;
      score += skill.yearsOfExperience || 0;
      score += skill.endorsementCount || 0;
      if (skill.source === "resume") score += 2;
      if (skill.source === "endorsed") score += 3;
      
      userSkillsMap[userId].skills.push({
        skillName: skill.skillName,
        category: skill.category,
        proficiencyLevel: skill.proficiencyLevel,
        yearsOfExperience: skill.yearsOfExperience,
        source: skill.source,
        endorsementCount: skill.endorsementCount,
        _id: skill._id
      });
      userSkillsMap[userId].totalScore += score;
    });

    // Get profiles for users
    const userIds = Object.keys(userSkillsMap);
    const profiles = await EmployeeProfile.find({
      userId: { $in: userIds }
    });

    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.userId.toString()] = profile;
    });

    // Build results
    const results = Object.values(userSkillsMap).map(item => ({
      employee: item.user,
      profile: profileMap[item.user._id.toString()] || null,
      skills: item.skills,
      matchScore: Math.round(item.totalScore / item.skills.length * 10) / 10
    }));

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