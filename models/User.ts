import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  userId: String,
  name: String,
  email: String,
  password: String,
  accessKey: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  registeredAssignments: [{ type: mongoose.Types.ObjectId, ref: "Assignment" }],
  assignmentConsents: [{ type: mongoose.Types.ObjectId, ref: "Assignment" }],
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model("User", UserSchema);
