const SkillCatalog = require("../models/SkillCatalog");

const getSkillCatalog = async (req, res) => {
  try {
    const skills = await SkillCatalog.find({
      isActive: true,
    }).sort({
      skillName: 1,
    });

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch skill catalog",
    });
  }
};

module.exports = {
  getSkillCatalog
};