const express = require("express");
const multer = require("multer");
const Petition = require("../models/petition");
const User = require("../models/user");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Description = require("../models/desc");

const authMiddleware = (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all petitions
router.get("/", async (req, res) => {
  const { department } = req.query;
  try {
    let filter = {};
    if (department) {
      filter.category = department;
    }
    // const petitions = await Petition.find(filter).populate("userId", "name role");
    const petitions = await Petition.find(filter);
    // console.log(petitions);
    res.json(petitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a timeline event to a petition
router.post("/:id/timeline", async (req, res) => {
  const { id } = req.params;
  const { eventType, description } = req.body;

  if (!eventType || !description) {
    return res
      .status(400)
      .json({ message: "Event type and description are required." });
  }

  try {
    const petition = await Petition.findById(id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found." });
    }

    const newEvent = {
      eventType,
      description,
      createdAt: new Date(),
    };

    petition.timeline.push(newEvent);
    await petition.save();

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error adding timeline event:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// routes/petitions.js
// Update the department of a petition
router.patch("/:id/department", async (req, res) => {
  const { id } = req.params;
  const { department } = req.body;

  if (!department) {
    return res.status(400).json({ message: "Department is required." });
  }

  try {
    const petition = await Petition.findById(id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found." });
    }

    petition.category = department;
    await petition.save();

    res.status(200).json({ department: petition.category });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update the department of a petition
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "New Status is required." });
  }

  try {
    const petition = await Petition.findById(id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found." });
    }

    petition.status = status;
    await petition.save();

    res.status(200).json({ status: petition.status });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post(
  "/",
  authMiddleware,
  upload.array("attachments", 5),
  async (req, res) => {
    try {
      //   const petitionData = req.body;
      const {
        title,
        description,
        category,
        governmentLevel,
        priority,
        aiSummary,
      } = req.body;

      const userId = req.user.userId;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const attachments = req.files
        ? req.files.map((file) => file.buffer.toString("base64"))
        : [];

      const petition = new Petition({
        blockchainId: -99999,
        title: title,
        description: description,
        creator: "0x1db8A58efF4B9e8929D778fe165279eeB49d7379",
        category: category || "Uncategorized",
        governmentLevel: governmentLevel || "Local",
        priority: priority || "Medium",
        userId: userId,
        aiSummary: aiSummary || "Will take some time. Please, wait.",
        attachments: attachments,
      });

      await petition.save();

      try {
        const descDoc = new Description({
          description: petition.description,
          blockchainId: petition.blockchainId,
          aiSummary: petition.aiSummary,
          priority: priority || "Uninitialized",
          petitionId: petition._id,
          category: petition.category,
        });
        await descDoc.save();
      } catch (err) {
        console.error("Description save error:", descError);
        return res.status(500).json({ message: "Error saving description" });
      }

      res.status(201).json({ message: "Petition created successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
      });
    }
  }
);

module.exports = router;
