const express = require("express");

const router = express.Router();

const {
  addSkill,
  getMySkills,
  updateSkill,
  deleteSkill,
  searchEmployees,
} = require("../controllers/skillController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post("/", protect, addSkill);

router.get("/", protect, getMySkills);

router.get("/search", protect, searchEmployees);
// router.get("/search", protect, searchSkills);

router.put("/:id", protect, updateSkill);

router.delete("/:id", protect, deleteSkill);

module.exports = router;