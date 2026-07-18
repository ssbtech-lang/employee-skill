const express = require("express");

const {
  createProfile,
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
} = require("../controllers/profileController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create profile
router.post(
  "/",
  protect,
  createProfile
);

// Logged-in user's profile
router.get(
  "/me",
  protect,
  getMyProfile
);

// Update logged-in profile
router.put(
  "/me",
  protect,
  updateMyProfile
);

// Get another employee profile
router.get(
  "/:userId",
  protect,
  getProfileByUserId
);

module.exports = router;