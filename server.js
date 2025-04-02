const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
// const cors = require('cors');
// app.use(cors({ origin: 'http://localhost:3000' }));
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads",express.static("uploads"));

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("CitizenConnect API is Running");
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


const petitionRoutes = require("./routes/petition");
app.use("/api/petitions", petitionRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const viewRoutes = require("./routes/viewpetition")
app.use("/api/petition", viewRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

