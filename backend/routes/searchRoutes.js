const express = require("express");

const router = express.Router();

const {
  searchEmployees,
} = require("../controllers/searchController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/employees",
  protect,
  authorizeRoles("manager", "hr", "ld"),
  searchEmployees
);

module.exports = router;