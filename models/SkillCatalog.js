const mongoose = require("mongoose");

const skillCatalogSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Frontend",
        "Backend",
        "Programming",
        "Database",
        "Cloud",
        "DevOps",
        "AI/ML",
        "Soft Skill",
        "Testing",
        "Other",
      ],
      default: "Other",
    },

    aliases: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SkillCatalog",
  skillCatalogSchema
);