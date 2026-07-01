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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmployeeProfile",
  employeeProfileSchema
);