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
    },

    department: String,
    designation: String,
    location: String,
    careerInterests: [String],

    education: [String],
    certifications: [String],
    experience: [String],

    skills: [
      {
        name: String,
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          default: "Beginner",
        },
        years: {
          type: Number,
          default: 0,
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

    resumeFileName: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmployeeProfile",
  employeeProfileSchema
);