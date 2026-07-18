const express = require("express");
const router = express.Router();

const {
  searchEmployees,
  advancedEmployeeSearch,
} = require("../controllers/searchController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Advanced Search
router.get(
  "/advanced",
  protect,
  authorizeRoles("manager", "hr"),
  advancedEmployeeSearch
);

// Basic Search
router.get(
  "/employees",
  protect,
  authorizeRoles("manager", "hr", "ld"),
  searchEmployees
);

module.exports = router;