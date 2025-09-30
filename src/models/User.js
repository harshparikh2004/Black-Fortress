import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true, minlength: 3, maxlength: 64, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user", index: true },
  failedLoginCount: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
}, { timestamps: true });

export const User = model("User", userSchema);


