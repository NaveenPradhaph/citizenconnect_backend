const mongoose = require("mongoose");

const governmentschema = new mongoose.Schema({
  govid: {type: String, unique: true, required: true},
  department: {type: String, reuired: true}
})

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["citizen", "government", "admin"], default: "citizen" },
  government: [governmentschema]
});

module.exports = mongoose.model("User", UserSchema);
