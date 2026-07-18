const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
      min: 0,
    },

    source: {
      type: String,
      enum: ["self", "resume", "endorsed"],
      default: "self",
    },

    endorsementCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Used for case-insensitive skill searches.
 */
skillSchema.index({
  skillName: 1,
});

/*
 * Used when retrieving all skills belonging to an employee.
 */
skillSchema.index({
  userId: 1,
  skillName: 1,
});

/*
 * Used for skill search combined with minimum or maximum experience.
 */
skillSchema.index({
  skillName: 1,
  yearsOfExperience: -1,
});

/*
 * Used when filtering by proficiency and experience.
 */
skillSchema.index({
  proficiencyLevel: 1,
  yearsOfExperience: -1,
});

/*
 * Normalise entered skill names before saving.
 *
 * Mongoose 9 does not require next().
 */
skillSchema.pre("save", function normalizeSkillData() {
  if (typeof this.skillName === "string") {
    this.skillName = this.skillName.trim();
  }

  if (typeof this.category === "string") {
    this.category = this.category.toLowerCase();
  }

  if (typeof this.proficiencyLevel === "string") {
    this.proficiencyLevel =
      this.proficiencyLevel.toLowerCase();
  }

  if (typeof this.source === "string") {
    this.source = this.source.toLowerCase();
  }
});

module.exports = mongoose.model("Skill", skillSchema);

