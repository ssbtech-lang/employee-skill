const User = require("../models/User");
const Skill = require("../models/Skill");
const RoleRequirement = require("../models/RoleRequirement");
const LearningRecommendation = require("../models/LearningRecommendation");
const generateRecommendation = require("../services/groqService");

/**
 * Normalizes a skill name for consistent comparison
 * (trims whitespace and converts to lowercase).
 */
const normalize = (skill) => skill.trim().toLowerCase();

/**
 * GET/POST handler: Generates a skill-gap report for an employee against a role.
 *
 * Steps:
 * 1. Validate employee and role exist.
 * 2. Compare employee's skills vs role's required skills.
 * 3. Return a cached AI recommendation if one already exists.
 * 4. Otherwise, generate a new AI recommendation, save it, and return it.
 */
const generateSkillGapReport = async (req, res) => {
  try {
    const { employeeId, roleId } = req.params;

    // --- Validate employee ---
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // --- Validate role requirement ---
    const role = await RoleRequirement.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role requirement not found",
      });
    }

    // --- Fetch and normalize employee's current skills ---
    const employeeSkills = await Skill.find({ userId: employeeId });
    const employeeSkillNames = employeeSkills.map((skill) =>
      normalize(skill.skillName)
    );

    // --- Normalize the role's required skills ---
    const requiredSkills = role.requiredSkills.map((skill) =>
      normalize(skill.skillName)
    );

    // --- Compute skill gap: matched, missing, and extra skills ---
    const matchedSkills = [];
    const missingSkills = [];
    const extraSkills = [];

    requiredSkills.forEach((skill) => {
      if (employeeSkillNames.includes(skill)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    employeeSkillNames.forEach((skill) => {
      if (!requiredSkills.includes(skill)) {
        extraSkills.push(skill);
      }
    });

    // --- Calculate match percentage (100% if role has no required skills) ---
    const matchPercentage =
      requiredSkills.length === 0
        ? 100
        : Math.round((matchedSkills.length / requiredSkills.length) * 100);

    // --- Check if a recommendation already exists for this employee/role pair ---
    const existingRecommendation = await LearningRecommendation.findOne({
      employeeId,
      roleId,
    });

    if (existingRecommendation) {
      // Return cached recommendation instead of calling the AI service again
      return res.status(200).json({
        success: true,
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
        },
        role: {
          id: role._id,
          roleName: role.roleName,
        },
        totalRequiredSkills: requiredSkills.length,
        matchedSkills,
        missingSkills,
        extraSkills,
        matchPercentage,
        aiRecommendation: existingRecommendation.aiRecommendation,
        cached: true,
        message: "Learning recommendation retrieved from database.",
      });
    }

    // --- No cached recommendation found: generate a new one via AI service ---
    let aiRecommendation = {};

    try {
      const aiResponse = await generateRecommendation({
        employeeName: employee.name,
        roleName: role.roleName,
        matchedSkills,
        missingSkills,
        extraSkills,
        matchPercentage,
      });

      aiRecommendation = JSON.parse(aiResponse);

      // Persist the newly generated recommendation for future requests
      await LearningRecommendation.create({
        employeeId,
        roleId,
        matchPercentage,
        matchedSkills,
        missingSkills,
        extraSkills,
        aiRecommendation,
      });
    } catch (error) {
      // AI generation/parsing failure shouldn't crash the whole request;
      // aiRecommendation stays as an empty object and the skill-gap data still returns.
      console.error("❌ AI Error:", error);
      console.error(error.stack);
    }

    return res.status(200).json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
      },
      role: {
        id: role._id,
        roleName: role.roleName,
      },
      totalRequiredSkills: requiredSkills.length,
      matchedSkills,
      missingSkills,
      extraSkills,
      matchPercentage,
      aiRecommendation,
      cached: false,
      message: "Learning recommendation generated successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateSkillGapReport,
};
