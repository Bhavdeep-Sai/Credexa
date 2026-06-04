import mongoose, { Schema, Document, Model } from "mongoose";
import { IAnalysis } from "@/types";

export interface IAnalysisDocument extends Omit<IAnalysis, "_id" | "createdAt">, Document {
  createdAt: Date;
}

const AnalysisResultSchema = new Schema({
  riskLevel: {
    type: String,
    enum: ["Safe", "Suspicious", "Dangerous"],
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  redFlags: {
    type: [String],
    default: [],
  },
  explanation: {
    type: String,
    required: true,
  },
  recommendations: {
    type: [String],
    default: [],
  },
  safeReply: {
    type: String,
    default: "",
  },
});

const AnalysisSchema = new Schema<IAnalysisDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    contentType: {
      type: String,
      enum: ["text", "url", "screenshot", "voice"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    result: {
      type: AnalysisResultSchema,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Analysis: Model<IAnalysisDocument> = mongoose.models.Analysis || mongoose.model<IAnalysisDocument>("Analysis", AnalysisSchema);

export default Analysis;
