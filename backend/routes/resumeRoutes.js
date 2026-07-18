// const express = require("express");
// const multer = require("multer");
// const { spawn } = require("child_process");
// const path = require("path");
// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ st
// orage });

// router.post("/parse-resume", upload.single("resume"), (req, res) => {
// const filePath = req.file.path;

// const pythonProcess = spawn("python", [
// "resumeparser.py",
// filePath
// ]);

// let result = "";

// pythonProcess.stdout.on("data", (data) => {
// result += data.toString();
// });

// pythonProcess.stderr.on("data", (data) => {
// console.error(data.toString());
// });

// pythonProcess.on("close", () => {
// try {
// const parsedData = JSON.parse(result);
// res.json(parsedData);
// } catch (error) {
// res.status(500).json({
// message: "Parsing failed"
// });
// }
// });
// });

// module.exports = router;

const fs=require("fs");
const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const EmployeeProfile = require("../models/EmployeeProfile");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// const upload = multer({ storage });
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const handleResumeUpload = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File size too large. Maximum allowed size is 5 MB.",
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    next();
  });
};

const normalizeSkillName = (skill) => {
  return skill
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

router.post("/parse-resume", handleResumeUpload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No resume file uploaded. Please upload a PDF or DOCX file using field name 'resume'.",
    });
  }

  const filePath = req.file.path;
  let result = "";
  let errorOutput = "";

  console.log("File path:", filePath);
  console.log("Uploaded File:", req.file);

  const pythonProcess = spawn("python", ["resumeparser.py", filePath]);

  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error("Python error:", data.toString());
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        message: "Resume parser failed. Please upload a valid readable resume.",
        error: errorOutput,
      });
    }

    try {
      const parsedData = JSON.parse(result);

      return res.status(200).json({
        message: "Resume parsed successfully",
        fileName: req.file.filename,
        parsedData,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Parsing failed",
        error: error.message,
        rawOutput: result,
      });
    }
  });
});

router.post("/save-parsed-resume", async (req, res) => {
  try {
    const { userId, parsedData, resumeFileName } = req.body;

    if (!userId || !parsedData) {
      return res.status(400).json({
        message: "userId and parsedData are required",
      });
    }

    const skillMap = new Map();

(parsedData.skills || []).forEach((skill) => {
  const skillName =
    typeof skill === "string" ? skill : skill.name;

  if (!skillName) return;

  const normalizedKey = normalizeSkillName(skillName);

  if (!skillMap.has(normalizedKey)) {
    skillMap.set(normalizedKey, {
      name: skillName.trim(),
      normalizedName: normalizedKey,
      level: skill.level || "Beginner",
      years: skill.years || 0,
      source: "resume",
    });
  }
});

const formattedSkills = Array.from(skillMap.values());

    const existingProfile = await EmployeeProfile.findOne({ userId });

    const existingSkillNames =
  existingProfile?.skills?.map((skill) =>
    normalizeSkillName(skill.name)
  ) || [];

    const newSkills = formattedSkills.filter(
      (skill) =>
        skill.name &&
        !existingSkillNames.includes(skill.normalizedName)
    );

    const updatedProfile = await EmployeeProfile.findOneAndUpdate(
      { userId },
      {
        $addToSet: {
          skills: { $each: newSkills },
          education: { $each: parsedData.education || [] },
          certifications: { $each: parsedData.certifications || [] },
          experience: { $each: parsedData.experience || [] },
        },
        $set: {
          resumeParsed: true,
          resumeFileName: resumeFileName || "",
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Resume data saved to MongoDB successfully",
      addedSkillsCount: newSkills.length,
      skippedDuplicateSkills: formattedSkills.length - newSkills.length,
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saving resume data",
      error: error.message,
    });
  }
});

module.exports = router;