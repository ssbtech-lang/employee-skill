const mongoose = require("mongoose");

const requiredSkillSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
      trim: true,
    },

    minimumProficiency: {
      type: String,
      enum: [
        "beginner",
        "intermediate",
        "advanced",
        "expert",
      ],
      default: "beginner",
    },

    minimumExperience: {
      type: Number,
      default: 0,
      min: 0,
    },

    requiredEmployeeCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    mandatory: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

const roleRequirementSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    requiredSkills: {
      type: [requiredSkillSchema],
      default: [],
    },

    source: {
      type: String,
      enum: [
        "manual",
        "ai-generated",
        "industry-dataset",
      ],
      default: "manual",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roleRequirementSchema.index({
  roleName: 1,
  department: 1,
});

module.exports = mongoose.model(
  "RoleRequirement",
  roleRequirementSchema
);