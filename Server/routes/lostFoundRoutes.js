const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createLostFound,
  getLostFoundReports,
  getMyLostFoundReports,
  updateLostFound,
  deleteLostFound,
} = require("../controllers/lostFoundController");

// All reports
router.get("/", getLostFoundReports);

// My reports
router.get("/my-reports", authMiddleware, getMyLostFoundReports);

// Create report
router.post("/", authMiddleware, createLostFound);

// Update report
router.put("/:id", authMiddleware, updateLostFound);

// Delete report
router.delete("/:id", authMiddleware, deleteLostFound);

module.exports = router;