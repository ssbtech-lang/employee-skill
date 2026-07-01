const Skill = require("../models/Skill");

const addSkill = async (req, res) => {
  try {
    const skill = await Skill.create({
      userId: req.user._id,
      skillName: req.body.skillName,
      category: req.body.category,
      proficiencyLevel: req.body.proficiencyLevel,
      yearsOfExperience: req.body.yearsOfExperience,
    });

    res.status(201).json({
      message: "Skill added",
      skill,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({
      userId: req.user._id,
    });

    res.status(200).json({
      count: skills.length,
      skills,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can update only your own skill" });
    }

    const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({ message: "Skill updated", updatedSkill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
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
};