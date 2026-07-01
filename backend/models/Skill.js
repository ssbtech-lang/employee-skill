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
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "technical",
        "soft",
      ],
      required: true,
    },

    proficiencyLevel: {
      type: String,
      enum: [
        "beginner",
        "intermediate",
        "advanced",
        "expert",
      ],
      required: true,
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    source: {
      type: String,
      enum: [
        "self",
        "resume",
        "endorsed",
      ],
      default: "self",
    },

    endorsementCount: {
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