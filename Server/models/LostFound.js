
const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    type: {
      type: String,
      enum: ["Lost", "Found"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Electronics",
        "Books",
        "Documents",
        "Clothing",
        "Accessories",
        "Other",
      ],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    contact: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Resolved"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LostFound", lostFoundSchema);
