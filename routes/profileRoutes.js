const express = require("express");
const router = express.Router();
const {
  createProfile,
} = require("../controllers/profileController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  getProfileByUserId,
} = require("../controllers/profileController");


router.get("/:userId", getProfileByUserId);
router.post(
  "/",
  protect,
  createProfile,
  getProfileByUserId,
);

module.exports = router;