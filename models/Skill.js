const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    skillName: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "technical",
        "soft",
      ],
    },

    proficiencyLevel: {
      type: String,
      enum: [
        "beginner",
        "intermediate",
        "advanced",
        "expert",
      ],
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Skill",
  skillSchema
);