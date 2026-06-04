import mongoose, { Schema, Document, Model } from "mongoose";
import { ISystemLog } from "@/types";

export interface ISystemLogDocument extends Omit<ISystemLog, "_id" | "createdAt">, Document {
  createdAt: Date;
}

const SystemLogSchema = new Schema<ISystemLogDocument>({
  logType: {
    type: String,
    enum: ["info", "warn", "error"],
    required: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  details: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SystemLog: Model<ISystemLogDocument> = mongoose.models.SystemLog || mongoose.model<ISystemLogDocument>("SystemLog", SystemLogSchema);

export default SystemLog;
