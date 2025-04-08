const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema({
    petitionId: {
      type: Number,
      required: true
    },
    signatureId: {
      type: Number,
      required: true
    },
    signer: String,
    name: String,
    timestamp: Date,
    // Additional off-chain data
    email: String,
    location: String,
    verified: Boolean
  });
module.exports = mongoose.model("Signature", signatureSchema);