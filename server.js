const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const BlockchainDBBridge = require("./blockchain-mongodb-bridge");
const mongoose = require('mongoose');


const app = express();
const bridge = new BlockchainDBBridge();

// Middleware
app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect("mongodb://localhost:27017/petition_management")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Initialize blockchain connection on startup
bridge
  .init()
  .then((result) => {
    if (result.success) {
      console.log("Connected to blockchain and MongoDB");
    } else {
      console.error("Failed to connect to blockchain:", result);
    }
  })
  .catch((err) => {
    console.error("Error during initialization:", err);
  });

app.post("/api/petitions", async (req, res) => {
  try {
    const petitionData = req.body;
    const result = await bridge.createPetition(petitionData);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        petitionId: result.petitionId || null,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
});

app.post("/api/petitions/:id/sign", async (req, res) => {
  try {
    const petitionId = parseInt(req.params.id);
    const { name, fromAddress } = req.body;

    const result = await bridge.signPetition({ petitionId, name, fromAddress });
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        petitionId: result.petitionId || null,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
