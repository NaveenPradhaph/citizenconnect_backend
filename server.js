const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// const BlockchainDBBridge = require("./blockchain-mongodb-bridge");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
// const bridge = new BlockchainDBBridge();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(`${process.env.MONGO_URI}/petition_management`)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully!");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected!");
});

// // Initialize blockchain connection on startup
// bridge
//   .init()
//   .then((result) => {
//     if (result.success) {
//       console.log("Connected to blockchain and MongoDB");
//     } else {
//       console.error("Failed to connect to blockchain:", result);
//     }
//   })
//   .catch((err) => {
//     console.error("Error during initialization:", err);
//   });

const petitionRoutes = require("./routes/petitions");
app.use("/api/petitions", petitionRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const viewRoutes = require("./routes/viewPetitions");
app.use("/api/petition", viewRoutes);

// app.post("/api/petitions/:id/sign", async (req, res) => {
//   try {
//     const petitionId = parseInt(req.params.id);
//     const { name, email, fromAddress } = req.body;

//     const result = await bridge.signPetition({
//       petitionId,
//       name,
//       email,
//       fromAddress,
//     });
//     if (result.success) {
//       res.status(201).json(result);
//     } else {
//       res.status(500).json({
//         success: false,
//         message: result.message,
//         petitionId: result.petitionId || null,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `Server error: ${error.message}`,
//     });
//   }
// });
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
