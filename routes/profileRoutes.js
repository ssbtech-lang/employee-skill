const express = require("express");
const router = express.Router();

const {
  createProfile,
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
} = require("../controllers/profileController");

const {
  protect,
} = require("../middleware/authMiddleware");

// Create logged-in employee's profile
router.post("/", protect, createProfile);

// View logged-in employee's own profile
router.get("/me", protect, getMyProfile);

// Update logged-in employee's own profile
router.put("/me", protect, updateMyProfile);

// View another employee's profile
router.get("/:userId", protect, getProfileByUserId);

module.exports = router;