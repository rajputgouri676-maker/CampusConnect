
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerContact,
} = require("../controllers/productController");

// Get all available products
router.get("/", getProducts);

// Get logged-in user's products
router.get("/my-products", authMiddleware, getMyProducts);

// Get seller contact details
router.get("/:id/contact", authMiddleware, getSellerContact);

// Get single product by ID
router.get("/:id", getProductById);

// Create product
router.post("/", authMiddleware, createProduct);

// Update product
router.put("/:id", authMiddleware, updateProduct);

// Remove product
router.delete("/:id", authMiddleware, deleteProduct);

// Upload product images
router.post(
  "/upload-images",
  authMiddleware,
  upload.array("images", 5),
  (req, res) => {
    try {
      const images = req.files.map(
        (file) => `/uploads/${file.filename}`
      );

      res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        images,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
