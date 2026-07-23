const express = require("express");

const {
  getRecommendation
} = require("../controllers/recommendationController");

const {
  protect,
  authorizeRoles
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
  getRecommendation
);

module.exports = router;
