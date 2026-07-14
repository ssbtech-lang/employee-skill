// const express = require("express");

// const {
//   createProfile,
// } = require("../controllers/profileController");

// const {
//   protect,
// } = require("../middleware/authMiddleware");

// const router = express.Router();

// router.post(
//   "/",
//   protect,
//   createProfile
// );

// module.exports = router;




const express = require("express");
const { createProfile, getProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getProfile);
router.post("/", protect, createProfile);

module.exports = router;