
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const uploadProfilePhoto = require("../middleware/uploadProfilePhoto");
const User = require("../models/User");

// Register
router.post(
  "/register",
  uploadProfilePhoto.single("profilePhoto"),
  registerUser
);

// Login
router.post("/login", loginUser);

// Get Student Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
});

// Update Student Profile
router.put(
  "/profile",
  authMiddleware,
  uploadProfilePhoto.single("profilePhoto"),
  async (req, res) => {
    try {
      const { name, mobile, branch, allowContact } = req.body;

      if (!name || !mobile || !branch) {
        return res.status(400).json({
          success: false,
          message: "Name, mobile and branch are required",
        });
      }

      if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit mobile number",
        });
      }

      const existingMobile = await User.findOne({
        mobile: mobile.trim(),
        _id: { $ne: req.user.userId },
      });

      if (existingMobile) {
        return res.status(409).json({
          success: false,
          message: "Mobile number is already registered",
        });
      }

      const updateData = {
        name: name.trim(),
        mobile: mobile.trim(),
        branch: branch.trim(),
      };

      // Contact permission
      if (allowContact !== undefined) {
        updateData.allowContact = allowContact === true || allowContact === "true";
      }

      // Update photo only if a new photo is uploaded
      if (req.file) {
        updateData.profilePhoto = `/uploads/profiles/${req.file.filename}`;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Profile update error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Server error while updating profile",
      });
    }
  }
);

module.exports = router;
