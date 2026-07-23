const mongoose = require("mongoose");

/**
 * LearningRecommendation Schema
 * ------------------------------
 * Stores AI-generated learning recommendations for an employee,
 * based on how well their skills match a given role's requirements.
 */
const learningRecommendationSchema = new mongoose.Schema(
  {
    // Reference to the employee (User) this recommendation is for
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reference to the role requirement being matched against
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoleRequirement",
      required: true,
    },

    // Overall percentage match between employee's skills and role requirements
    matchPercentage: {
      type: Number,
      required: true,
    },

    // Skills the employee has that match the role's requirements
    matchedSkills: [String],

    // Skills required by the role that the employee currently lacks
    missingSkills: [String],

    // Skills the employee has that aren't required by the role (bonus skills)
    extraSkills: [String],

    // AI-generated recommendation data (e.g., courses, learning paths, resources)
    aiRecommendation: {
      type: Object,
      required: true,
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the model for use in other parts of the application
module.exports = mongoose.model(
  "LearningRecommendation",
  learningRecommendationSchema
);
