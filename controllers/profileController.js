const mongoose = require("mongoose");
const EmployeeProfile = require("../models/EmployeeProfile");

// Create logged-in user's profile
const createProfile = async (req, res) => {
  try {
    const existingProfile = await EmployeeProfile.findOne({
      userId: req.user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists",
      });
    }

    const profile = await EmployeeProfile.create({
      userId: req.user._id,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("Create profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create profile",
      error: error.message,
    });
  }
};

// Get logged-in user's profile
const getMyProfile = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({
      userId: req.user._id,
    }).populate("userId", "name email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get my profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// Update logged-in user's profile
const updateMyProfile = async (req, res) => {
  try {
    // Do not allow userId to be changed through request body
    const { userId, ...allowedUpdates } = req.body;

    const profile = await EmployeeProfile.findOneAndUpdate(
      {
        userId: req.user._id,
      },
      {
        $set: allowedUpdates,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Get another user's profile using userId
const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const profile = await EmployeeProfile.findOne({
      userId,
    }).populate("userId", "name email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
};