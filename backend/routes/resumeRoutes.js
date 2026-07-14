const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post("/parse-resume", upload.single("resume"), (req, res) => {
const filePath = req.file.path;

const pythonProcess = spawn("python", [
"resumeparser.py",
filePath
]);

let result = "";

pythonProcess.stdout.on("data", (data) => {
result += data.toString();
});

pythonProcess.stderr.on("data", (data) => {
console.error(data.toString());
});

pythonProcess.on("close", () => {
try {
const parsedData = JSON.parse(result);
res.json(parsedData);
} catch (error) {
res.status(500).json({
message: "Parsing failed"
});
}
});
});

module.exports = router;
