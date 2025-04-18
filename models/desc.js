const mongoose = require("mongoose");

const DescSchema = new mongoose.Schema({
  description: { type: String, required: true },
  blockchainId: {
    type: Number,
    required: true,
  },
  aiSummary: { type: String },
  category: { type: String},
  priority: { type: String, enum: ["Low", "Medium", "High", "Urgent", "Uninitialized"], default: "Medium" },
  petitionId : { type: mongoose.Schema.Types.ObjectId, ref: "Petition", required: true },
  block_generate : {type:Boolean, default:false},
  ai_generate : {type:Boolean, default:false},
  urgency_generate : {type:Boolean, default:false},
  category_generator : {type:Boolean, default:false},
  createdAt : {type:Date, default:Date.now}
});

module.exports = mongoose.model("Description", DescSchema);