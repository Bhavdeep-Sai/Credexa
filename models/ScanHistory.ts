import mongoose, { Schema, Document, Model } from "mongoose";
import { IScanHistory } from "@/types";

export interface IScanHistoryDocument extends Omit<IScanHistory, "_id" | "createdAt">, Document {
  createdAt: Date;
}

const ScanHistorySchema = new Schema<IScanHistoryDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  analysisId: {
    type: Schema.Types.ObjectId,
    ref: "Analysis",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  contentType: {
    type: String,
    enum: ["text", "url", "screenshot", "voice"],
    required: true,
  },
  riskLevel: {
    type: String,
    enum: ["Safe", "Suspicious", "Dangerous"],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ScanHistory: Model<IScanHistoryDocument> = mongoose.models.ScanHistory || mongoose.model<IScanHistoryDocument>("ScanHistory", ScanHistorySchema);

export default ScanHistory;
