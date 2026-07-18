// const mongoose = require("mongoose");

// const employeeProfileSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     department: String,
//     designation: String,
//     location: String,
//     careerInterests: [String],

//     education: [String],
//     certifications: [String],
//     experience: [String],

//     skills: [
//       {
//         name: String,
//         level: {
//           type: String,
//           enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
//           default: "Beginner",
//         },
//         years: {
//           type: Number,
//           default: 0,
//         },
//         source: {
//           type: String,
//           enum: ["self", "resume"],
//           default: "resume",
//         },
//       },
//     ],

//     resumeParsed: {
//       type: Boolean,
//       default: false,
//     },

//     resumeFileName: String,
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model(
//   "EmployeeProfile",
//   employeeProfileSchema
// );

const mongoose = require("mongoose");

const employeeProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    designation: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    careerInterests: {
      type: [String],
      default: [],
    },

    education: {
      type: [String],
      default: [],
    },

    /*
     * Preserve this field because your resume parser may already
     * save extracted certification names here.
     *
     * Manual certification CRUD uses the separate Certification model.
     */
    certifications: {
      type: [String],
      default: [],
    },

    experience: {
      type: [String],
      default: [],
    },

    /*
     * Preserve embedded resume skills for compatibility with the
     * existing resume parser and save-parsed-resume API.
     *
     * Manual skill CRUD uses the separate Skill collection.
     */
    skills: [
      {
        name: {
          type: String,
          trim: true,
        },

        level: {
          type: String,
          enum: [
            "Beginner",
            "Intermediate",
            "Advanced",
            "Expert",
          ],
          default: "Beginner",
        },

        years: {
          type: Number,
          default: 0,
          min: 0,
        },

        source: {
          type: String,
          enum: ["self", "resume"],
          default: "resume",
        },
      },
    ],

    resumeParsed: {
      type: Boolean,
      default: false,
    },

    resumeFileName: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Supports department filtering.
 */
employeeProfileSchema.index({
  department: 1,
});

/*
 * Supports designation filtering.
 */
employeeProfileSchema.index({
  designation: 1,
});

/*
 * Supports location filtering.
 */
employeeProfileSchema.index({
  location: 1,
});

/*
 * Supports combined talent-discovery filters.
 */
employeeProfileSchema.index({
  department: 1,
  location: 1,
  designation: 1,
});

/*
 * Supports education filtering.
 */
employeeProfileSchema.index({
  education: 1,
});

/*
 * Clean profile strings before saving.
 * No next() is used because your Mongoose version uses promise-based hooks.
 */
employeeProfileSchema.pre(
  "save",
  function normalizeEmployeeProfile() {
    const cleanStringArray = (values) => {
      if (!Array.isArray(values)) {
        return [];
      }

      return [
        ...new Set(
          values
            .filter(
              (value) =>
                typeof value === "string"
            )
            .map((value) => value.trim())
            .filter(Boolean)
        ),
      ];
    };

    if (typeof this.department === "string") {
      this.department = this.department.trim();
    }

    if (typeof this.designation === "string") {
      this.designation = this.designation.trim();
    }

    if (typeof this.location === "string") {
      this.location = this.location.trim();
    }

    if (typeof this.resumeFileName === "string") {
      this.resumeFileName =
        this.resumeFileName.trim();
    }

    this.careerInterests = cleanStringArray(
      this.careerInterests
    );

    this.education = cleanStringArray(
      this.education
    );

    this.certifications = cleanStringArray(
      this.certifications
    );

    this.experience = cleanStringArray(
      this.experience
    );

    if (Array.isArray(this.skills)) {
      this.skills.forEach((skill) => {
        if (
          skill &&
          typeof skill.name === "string"
        ) {
          skill.name = skill.name.trim();
        }
      });
    }
  }
);

module.exports = mongoose.model(
  "EmployeeProfile",
  employeeProfileSchema
);
