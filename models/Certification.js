const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    certificationName: {
      type: String,
      required: [true, "Certification name is required"],
      trim: true,
      maxlength: [150, "Certification name cannot exceed 150 characters"],
    },

    issuingOrganization: {
      type: String,
      required: [true, "Issuing organization is required"],
      trim: true,
      maxlength: [150, "Issuing organization cannot exceed 150 characters"],
    },

    issueDate: {
      type: Date,
      required: [true, "Issue date is required"],
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    doesNotExpire: {
      type: Boolean,
      default: false,
    },

    credentialId: {
      type: String,
      trim: true,
      default: null,
      maxlength: [200, "Credential ID cannot exceed 200 characters"],
    },

    credentialUrl: {
      type: String,
      trim: true,
      default: null,
      maxlength: [500, "Credential URL cannot exceed 500 characters"],
    },

    skills: {
      type: [String],
      default: [],
    },

    source: {
      type: String,
      enum: ["manual", "resume"],
      default: "manual",
    },

    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Prevent the same employee from accidentally saving the exact
 * same certification multiple times.
 *
 * sparse allows certifications without a credentialId.
 */
certificationSchema.index(
  {
    userId: 1,
    certificationName: 1,
    issuingOrganization: 1,
    credentialId: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

/*
 * Supports certification-based talent search.
 */
certificationSchema.index({
  certificationName: 1,
  userId: 1,
});

/*
 * Normalise string-array values before saving.
 */
certificationSchema.pre("save", function normalizeSkills() {
  if (Array.isArray(this.skills)) {
    this.skills = [
      ...new Set(
        this.skills
          .filter((skill) => typeof skill === "string")
          .map((skill) => skill.trim())
          .filter(Boolean)
      ),
    ];
  }
});

module.exports = mongoose.model("Certification", certificationSchema);