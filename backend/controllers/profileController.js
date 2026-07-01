const EmployeeProfile = require("../models/EmployeeProfile");

const createProfile = async (req, res) => {
  try {
    const existingProfile = await EmployeeProfile.findOne({
      userId: req.user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profile already exists",
      });
    }

    const profile = await EmployeeProfile.create({
      userId: req.user._id,
      department: req.body.department,
      designation: req.body.designation,
      location: req.body.location,
      careerInterests: req.body.careerInterests,
      education: req.body.education,
    });

    res.status(201).json({
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProfile,
};