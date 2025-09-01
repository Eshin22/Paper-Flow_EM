import mongoose, { Schema, Document } from "mongoose";

export interface IStudyLeaveRequest extends Document {
  userId: string;
  reason: string;
  fromDate: Date;
  toDate: Date;
  status: "pending" | "approved" | "rejected";
  reviewerComment?: string;
  createdAt: Date;
}

const StudyLeaveRequestSchema = new Schema<IStudyLeaveRequest>({
  userId: { type: String, required: true },
  reason: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  reviewerComment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.StudyLeaveRequest ||
  mongoose.model<IStudyLeaveRequest>("StudyLeaveRequest", StudyLeaveRequestSchema);