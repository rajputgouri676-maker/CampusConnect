const LostFound = require("../models/LostFound");
const createLostFound = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      location,
      date,
      image,
      contact,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !type ||
      !category ||
      !location?.trim() ||
      !date ||
      !contact
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!["Lost", "Found"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be Lost or Found",
      });
    }

    if (!/^[0-9]{10}$/.test(contact)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit contact number",
      });
    }

    const report = await LostFound.create({
      title: title.trim(),
      description: description.trim(),
      type,
      category,
      location: location.trim(),
      date,
      image: image || "",
      contact,
      reporter: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Lost & Found report created successfully",
      report,
    });
  } catch (error) {
    console.error("Create LostFound error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating report",
    });
  }
};


// GET ALL LOST / FOUND REPORTS
const getLostFoundReports = async (req, res) => {
  try {
    const { search, type, category, status } = req.query;

    const filter = {};

    if (search?.trim()) {
      const safeSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { location: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (type) {
      if (!["Lost", "Found"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid report type",
        });
      }

      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = "Active";
    }

    const reports = await LostFound.find(filter)
      .populate("reporter", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get LostFound reports error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching reports",
    });
  }
};


// GET LOGGED-IN USER'S REPORTS
const getMyLostFoundReports = async (req, res) => {
  try {
    const reports = await LostFound.find({
      reporter: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get my reports error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching your reports",
    });
  }
};


// UPDATE MY REPORT
const updateLostFound = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.reporter.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this report",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "type",
      "category",
      "location",
      "date",
      "image",
      "contact",
      "status",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        report[field] = req.body[field];
      }
    }

    if (report.contact && !/^[0-9]{10}$/.test(report.contact)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit contact number",
      });
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("Update LostFound error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating report",
    });
  }
};


// DELETE MY REPORT
const deleteLostFound = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.reporter.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this report",
      });
    }

    await report.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete LostFound error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting report",
    });
  }
};


module.exports = {
  createLostFound,
  getLostFoundReports,
  getMyLostFoundReports,
  updateLostFound,
  deleteLostFound,
};
