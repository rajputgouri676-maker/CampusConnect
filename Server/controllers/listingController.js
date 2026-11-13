const Listing = require("../models/listing");

// CREATE LISTING - Sell
const createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      price === undefined ||
      price === null ||
      price === "" ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description, price and category are required",
      });
    }

    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    const listing = await Listing.create({
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      category,
      condition,
      seller: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listing,
    });
  } catch (error) {
    console.error("Create listing error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating listing",
    });
  }
};

// GET ALL LISTINGS - Search, filters and pagination
const getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      condition,
      page = "1",
      limit = "10",
    } = req.query;

    // Validate pagination values
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 100",
      });
    }

    const filter = {};

    // Search by title
    if (search?.trim()) {
      filter.title = {
        $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by condition
    if (condition) {
      filter.condition = condition;
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};

      if (minPrice !== undefined && minPrice !== "") {
        priceFilter.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined && maxPrice !== "") {
        priceFilter.$lte = Number(maxPrice);
      }

      if (
        Object.values(priceFilter).some(
          (value) => !Number.isFinite(value) || value < 0,
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price filter",
        });
      }

      if (
        priceFilter.$gte !== undefined &&
        priceFilter.$lte !== undefined &&
        priceFilter.$gte > priceFilter.$lte
      ) {
        return res.status(400).json({
          success: false,
          message: "Minimum price cannot exceed maximum price",
        });
      }

      filter.price = priceFilter;
    }

    // Count all matching listings before pagination
    const totalListings = await Listing.countDocuments(filter);

    const totalPages = Math.ceil(totalListings / limitNumber);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch listings for the requested page
    const listings = await Listing.find(filter)
      .populate("seller", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      totalListings,
      currentPage: pageNumber,
      totalPages,
      pageSize: limitNumber,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Get listings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching listings",
    });
  }
};

// GET MY LISTINGS - Logged-in seller
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      seller: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Get my listings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching your listings",
    });
  }
};

// UPDATE MY LISTING
const updateListing = async (req, res) => {
  try {
    const { title, description, price, category, condition } = req.body;

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Only the seller who created this listing can update it
    if (listing.seller.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this listing",
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      listing.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
      }

      listing.description = description.trim();
    }

    if (price !== undefined) {
      if (price === null || price === "") {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number",
        });
      }

      const parsedPrice = Number(price);

      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number",
        });
      }

      listing.price = parsedPrice;
    }

    if (category !== undefined) {
      listing.category = category;
    }

    if (condition !== undefined) {
      listing.condition = condition;
    }

    await listing.save();

    return res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      listing,
    });
  } catch (error) {
    console.error("Update listing error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating listing",
    });
  }
};

// DELETE MY LISTING
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Only the seller can delete their own listing
    if (listing.seller.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this listing",
      });
    }

    await listing.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete listing error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting listing",
    });
  }
};

module.exports = {
  createListing,
  getListings,
  getMyListings,
  updateListing,
  deleteListing,
};
