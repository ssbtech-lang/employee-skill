const express = require("express");

const {
  createRoleRequirement,
  getAllRoleRequirements,
  getRoleRequirement,
  updateRoleRequirement,
  deleteRoleRequirement,
} = require("../controllers/roleRequirementController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(authorizeRoles("hr", "manager"), createRoleRequirement)
  .get(authorizeRoles("hr", "manager", "ld"), getAllRoleRequirements);

router
  .route("/:id")
  .get(authorizeRoles("hr", "manager", "ld"), getRoleRequirement)
  .put(authorizeRoles("hr", "manager"), updateRoleRequirement)
  .delete(authorizeRoles("hr", "manager"), deleteRoleRequirement);

module.exports = router;
