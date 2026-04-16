const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getSessionController,
  createSessionController,
} = require("../controllers/session.controllers");

const router = express.Router();

router.get("/", authMiddleware, getSessionController);
router.post("/", authMiddleware, createSessionController);

module.exports = router;
