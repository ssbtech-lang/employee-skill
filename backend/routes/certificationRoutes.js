const express = require("express");

const {
  createCertification,
  getMyCertifications,
  getCertificationsByUser,
  getCertificationById,
  updateCertification,
  deleteCertification,
} = require("../controllers/certificationController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * All certification APIs require authentication.
 */
router.use(protect);

/*
 * Important:
 * Keep /user/:userId above /:id.
 * Otherwise Express may interpret "user" as a certification ID.
 */
router.get(
  "/user/:userId",
  authorizeRoles("manager", "hr", "ld"),
  getCertificationsByUser
);

router
  .route("/")
  .post(
    authorizeRoles("employee", "manager", "hr", "ld"),
    createCertification
  )
  .get(getMyCertifications);

router
  .route("/:id")
  .get(getCertificationById)
  .put(updateCertification)
  .delete(deleteCertification);

module.exports = router;