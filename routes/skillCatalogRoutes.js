const express = require("express");

const router = express.Router();

const {
  getSkillCatalog,
} = require("../controllers/skillCatalogController");

router.get("/", getSkillCatalog);

module.exports = router;