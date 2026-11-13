const express = require("express");
const router = express.Router();

const {
  createListing,
  getListings,
  getMyListings,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getListings);
router.get("/my-listings", authMiddleware, getMyListings);
router.post("/", authMiddleware, createListing);
router.patch("/:id", authMiddleware, updateListing);
router.delete("/:id", authMiddleware, deleteListing);

module.exports = router;