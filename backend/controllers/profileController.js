const EmployeeProfile = require("../models/EmployeeProfile");

// Create or Update Profile
const createProfile = async (req, res) => {
  try {
    const { department, designation, location, careerInterests, education } = req.body;
    
    // Convert string to array if needed
    const careerInterestsArray = typeof careerInterests === 'string' 
      ? careerInterests.split(',').map(s => s.trim()).filter(Boolean)
      : careerInterests || [];
      
    const educationArray = typeof education === 'string'
      ? education.split(',').map(s => s.trim()).filter(Boolean)
      : education || [];

    let profile = await EmployeeProfile.findOne({ userId: req.user._id });

    if (profile) {
      // Update existing profile
      profile.department = department;
      profile.designation = designation;
      profile.location = location;
      profile.careerInterests = careerInterestsArray;
      profile.education = educationArray;
      await profile.save();
      
      return res.status(200).json({
        message: "Profile updated successfully",
        profile
      });
    }

    // Create new profile
    profile = await EmployeeProfile.create({
      userId: req.user._id,
      department,
      designation,
      location,
      careerInterests: careerInterestsArray,
      education: educationArray,
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

// Get Profile
const getProfile = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }
    
    // Convert arrays to strings for frontend display
    const profileData = profile.toObject();
    profileData.careerInterests = profileData.careerInterests?.join(', ') || '';
    profileData.education = profileData.education?.join(', ') || '';
    
    res.status(200).json(profileData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProfile,
  getProfile,
};