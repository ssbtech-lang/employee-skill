const express = require("express");
<<<<<<< HEAD:backend/routes/searchRoutes.js
const router = express.Router();

<<<<<<<< HEAD:backend/routes/searchRoutes.js
const router = express.Router();

const {
  searchEmployees,
=======

const router = express.Router();

const {
  searchEmployees,advancedEmployeeSearch,
>>>>>>> sreeja/backend-branch:routes/searchRoutes.js
} = require("../controllers/searchController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
<<<<<<< HEAD:backend/routes/searchRoutes.js
=======
  "/advanced",
  protect,
  authorizeRoles("manager", "hr"),
  advancedEmployeeSearch
);

router.get(
>>>>>>> sreeja/backend-branch:routes/searchRoutes.js
  "/employees",
  protect,
  authorizeRoles("manager", "hr", "ld"),
  searchEmployees
);
<<<<<<< HEAD:backend/routes/searchRoutes.js
========
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
>>>>>>>> sreeja/backend-branch:routes/profileRoutes.js
=======
>>>>>>> sreeja/backend-branch:routes/searchRoutes.js

module.exports = router;