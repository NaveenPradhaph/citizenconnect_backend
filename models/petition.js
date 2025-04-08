const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userRole: { type: String, enum: ["citizen", "government", "admin"], required: true }
});

const TimelineSchema = new mongoose.Schema({
    eventType: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  });

const PetitionSchema = new mongoose.Schema({
    blockchainId: {
        type: Number,
        required: true
      },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["Waiting", "Under Review", "In Progress", "Resolved", "Declined", "Pending"], 
      default: "Waiting" 
    },
    creator: String,
    priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    governmentLevel: { type: String, enum: ["Local", "State", "Central"], default: "Local" },
    votedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    aiSummary: { type: String },
    aiRecommendation: { type: String },
    votes: { type: Number, default: 0 },
    comments: [CommentSchema],
    timeline: [TimelineSchema],
    attachments: { type: [String], default: [] }
});
exports.PetitionSchema = PetitionSchema;

module.exports = mongoose.model("Petition", PetitionSchema);
