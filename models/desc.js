const mongoose = require("mongoose");

const DescSchema = new mongoose.Schema({
  description: { type: String, required: true },
  blockchainId: {
    type: Number,
    required: true,
  },
  aiSummary: { type: String },
  petitionId : { type: mongoose.Schema.Types.ObjectId, ref: "Petition", required: true },
  block_generate : {type:Boolean, default:false},
  ai_generate : {type:Boolean, default:false}
});

module.exports = mongoose.model("Description", DescSchema);