
const Product = require("../models/Product");

// Create Product
const createProduct = async (req, res) => {
  try {
    const { title, description, category, price, condition, images } = req.body;

    if (!title || !description || !category || price === undefined || price === null || price === "" || !condition) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required product details",
      });
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid price",
      });
    }

    const product = await Product.create({
      title,
      description,
      category,
      price: Number(price),
      condition,
      images: images || [],
      seller: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Product listed successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
};

// Get All Available Products
const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || !Number.isInteger(limitNumber) ||
        pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit",
      });
    }

    const filter = { status: "Available" };

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category && category.trim()) {
      filter.category = category.trim();
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("seller", "name branch university")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// Get My Products
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user.userId,
      status: { $ne: "Removed" },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get my products error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching your products",
    });
  }
};

// Get Single Product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      status: "Available",
    }).populate("seller", "name branch university");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { title, description, category, price, condition, images } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.userId,
      status: { $ne: "Removed" },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you are not authorized to edit it",
      });
    }

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (condition !== undefined) product.condition = condition;

    if (price !== undefined) {
      if (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid price",
        });
      }
      product.price = Number(price);
    }

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "Images must be an array",
        });
      }
      product.images = images;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating product",
    });
  }
};

// Delete Product (Soft Delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.userId,
      status: { $ne: "Removed" },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you are not authorized to remove it",
      });
    }

    product.status = "Removed";
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while removing product",
    });
  }
};

// Get Seller Contact Details
const getSellerContact = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      status: "Available",
    }).populate("seller", "name email mobile allowContact");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (product.seller._id.toString() === req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot request your own contact details",
      });
    }

    if (product.seller.allowContact !== true) {
      return res.status(403).json({
        success: false,
        message: "Seller has not enabled contact permission",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Seller contact details fetched successfully",
      seller: {
        name: product.seller.name,
        email: product.seller.email,
        mobile: product.seller.mobile,
      },
    });
  } catch (error) {
    console.error("Get seller contact error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while fetching seller contact",
    });
  }
};

// Export Functions
module.exports = {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerContact,
};
