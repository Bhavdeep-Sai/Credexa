export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  profilePicture: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalysisResult {
  riskLevel: "Safe" | "Suspicious" | "Dangerous";
  confidence: number; // Percentage e.g. 85.5
  category: string; // "Bank Fraud", "Phishing Link", "Safe Communication", etc.
  redFlags: string[];
  explanation: string;
  recommendations: string[];
  safeReply: string;
}

export interface IAnalysis {
  _id: string;
  userId?: string; // Optional for anonymous scans
  contentType: "text" | "url" | "screenshot" | "voice";
  content: string; // The raw input text, URL, or image/audio description
  result: IAnalysisResult;
  createdAt: Date;
}

export interface IScanHistory {
  _id: string;
  userId: string;
  analysisId: string;
  title: string;
  contentType: "text" | "url" | "screenshot" | "voice";
  riskLevel: "Safe" | "Suspicious" | "Dangerous";
  category: string;
  createdAt: Date;
}

export interface ISystemLog {
  _id: string;
  logType: "info" | "warn" | "error";
  action: string;
  details: string;
  userId?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface IAdminSettings {
  _id: string;
  maintenanceMode: boolean;
  allowedFileTypes: string[];
  maxFileSizeMB: number;
  basePrompt: string;
  updatedAt: Date;
  updatedBy: string; // Admin User ID
}
