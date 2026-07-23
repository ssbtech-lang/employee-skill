const Skill = require("../models/Skill");
const EmployeeProfile = require("../models/EmployeeProfile");
const LearningRecommendation = require("../models/LearningRecommendation");
const SkillCatalog = require("../models/SkillCatalog");
const { normalizeSkillName } = require("../utils/skillNormalization");

const levelScore = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

/**
 * Add a new skill for the logged-in user.
 * Validates the skill name against the Skill Catalog before creating it.
 */
const addSkill = async (req, res) => {
  try {
    // Normalize the incoming skill name
    const normalizedSkillName = await normalizeSkillName(req.body.skillName);

    const catalogSkill = await SkillCatalog.findOne({
      normalizedName: normalizedSkillName.toLowerCase(),
      isActive: true,
    });

    if (!catalogSkill) {
      return res.status(400).json({
        success: false,
        message: `'${req.body.skillName}' is not available in the Skill Catalog.`,
      });
    }

    const skill = await Skill.create({
      userId: req.user._id,
      skillName: catalogSkill.skillName,
      category: req.body.category,
      proficiencyLevel: req.body.proficiencyLevel,
      yearsOfExperience: req.body.yearsOfExperience,
      source: req.body.source || "self",
    });

    res.status(201).json({ message: "Skill added", skill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all skills belonging to the logged-in user.
 */
const getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.user._id });

    res.status(200).json({
      count: skills.length,
      skills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update a skill owned by the logged-in user.
 * Re-validates the skill name against the Skill Catalog if it is being changed,
 * and invalidates any cached learning recommendations for the employee.
 */
const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can update only your own skill",
      });
    }

    // Normalize skill name only if it is being updated
    if (req.body.skillName) {
      const normalizedSkillName = await normalizeSkillName(req.body.skillName);

      const catalogSkill = await SkillCatalog.findOne({
        isActive: true,
        $or: [
          { normalizedName: normalizedSkillName },
          { aliases: normalizedSkillName },
        ],
      });

      if (!catalogSkill) {
        return res.status(400).json({
          success: false,
          message: `'${req.body.skillName}' is not available in the Skill Catalog.`,
        });
      }

      req.body.skillName = catalogSkill.skillName;
    }

    const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Delete all cached recommendations for this employee
    const deleteResult = await LearningRecommendation.deleteMany({
      employeeId: skill.userId,
    });
    console.log("Recommendation cache deleted:", deleteResult);

    res.status(200).json({
      message: "Skill updated",
      updatedSkill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a skill owned by the logged-in user.
 */
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can delete only your own skill",
      });
    }

    await Skill.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Skill deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Search employees by skill name across both manually added skills
 * and resume-derived profiles, ranking results by a computed match score.
 */
const searchEmployees = async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({
        message: "Skill query is required",
      });
    }

    const manualSkills = await Skill.find({
      skillName: { $regex: skill, $options: "i" },
    }).populate("userId", "name email role");

    const resumeProfiles = await EmployeeProfile.find({
      "skills.name": { $regex: skill, $options: "i" },
    }).populate("userId", "name email role");

    // Score and format results from manually added skills
    const manualResults = manualSkills.map((s) => {
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
          source: s.source || "self",
          endorsementCount: s.endorsementCount || 0,
        },
        matchScore: score,
      };
    });

    // Score and format results from resume-derived skills
    const resumeResults = [];

    resumeProfiles.forEach((profile) => {
      profile.skills.forEach((s) => {
        if (s.name && s.name.toLowerCase().includes(skill.toLowerCase())) {
          let score = 0;

          score += levelScore[s.level] || 0;
          score += s.years || 0;

          if (s.source === "resume") score += 2;
          if (s.source === "self") score += 0;

          resumeResults.push({
            employee: profile.userId,
            matchedSkill: {
              skillName: s.name,
              proficiencyLevel: s.level,
              yearsOfExperience: s.years,
              source: s.source,
            },
            matchScore: score,
          });
        }
      });
    });

    const results = [...manualResults, ...resumeResults];

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
  addSkill,
  getMySkills,
  updateSkill,
  deleteSkill,
  searchEmployees,
};
