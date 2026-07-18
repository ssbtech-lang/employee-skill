const mongoose = require("mongoose");

const skillCatalogSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    normalizedName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
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
skillCatalogSchema.pre("save", function (next) {

  this.normalizedName = this.skillName
    .trim()
    .toLowerCase();

  if (this.aliases && this.aliases.length > 0) {
    this.aliases = [
      ...new Set(
        this.aliases.map(alias =>
          alias.trim().toLowerCase()
        )
      ),
    ];
  }

  next();
});
module.exports = mongoose.model(
  "SkillCatalog",
  skillCatalogSchema
);