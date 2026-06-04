import mongoose, { Schema, Document, Model } from "mongoose";
import { IAdminSettings } from "@/types";

export interface IAdminSettingsDocument extends Omit<IAdminSettings, "_id">, Document {}

const AdminSettingsSchema = new Schema<IAdminSettingsDocument>({
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  allowedFileTypes: {
    type: [String],
    default: ["image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/wav", "audio/x-m4a", "audio/mp3", "audio/mp4"],
  },
  maxFileSizeMB: {
    type: Number,
    default: 10,
  },
  basePrompt: {
    type: String,
    required: true,
    default: "You are Credexa AI, a specialized scam and phishing intelligence agent. Analyze the provided content (text, image OCR, or speech audio) and identify potential scams, threats, or misinformation.",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const AdminSettings: Model<IAdminSettingsDocument> = mongoose.models.AdminSettings || mongoose.model<IAdminSettingsDocument>("AdminSettings", AdminSettingsSchema);

export default AdminSettings;
