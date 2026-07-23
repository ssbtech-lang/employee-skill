const Recommendation = require("../models/LearningRecommendation");

const getRecommendation = async (req, res) => {
  try {

    const {
      employeeId,
      roleId
    } = req.params;

    const recommendation =
      await Recommendation.findOne({
        employeeId,
        roleId,
      });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message:
          "No recommendation found. Generate Skill Gap Report first.",
      });
    }

    res.status(200).json({
      success: true,
      cached: true,
      recommendation,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  getRecommendation,
};
