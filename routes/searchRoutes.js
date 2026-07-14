const express = require("express");

const router = express.Router();

const {
  searchEmployees,advancedEmployeeSearch,
} = require("../controllers/searchController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/advanced",
  protect,
  authorizeRoles("manager", "hr"),
  advancedEmployeeSearch
);

router.get(
  "/employees",
  protect,
  authorizeRoles("manager", "hr", "ld"),
  searchEmployees
);

module.exports = router;