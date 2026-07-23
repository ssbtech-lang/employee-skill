const express = require("express");

const {
  generateSkillGapReport,
} = require("../controllers/skillGapController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/:employeeId/:roleId",
  protect,
  authorizeRoles(
    "manager",
    "hr",
    "learning"
  ),
  generateSkillGapReport
);

module.exports = router;
