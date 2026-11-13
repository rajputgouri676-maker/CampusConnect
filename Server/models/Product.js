const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Books",
        "Electronics",
        "Stationery",
        "Cycles",
        "Clothing",
        "Other"
      ]
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair"],
      required: true
    },

    images: [{
      type: String
    }],

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["Available", "Sold", "Removed"],
      default: "Available"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);
