import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "@/types";

export interface IUserDocument extends Omit<IUser, "_id" | "createdAt" | "updatedAt">, Document {
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model query helper multiple times
const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
