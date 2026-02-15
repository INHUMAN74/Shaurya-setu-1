import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type CaseStatus = "active" | "paused" | "completed";

export interface IReintegrationCase extends Document {
  veteranId: Types.ObjectId;
  status: CaseStatus;
  startDate: Date;
  expectedEndDate: Date;
  createdAt: Date;
}

const ReintegrationCaseSchema = new Schema<IReintegrationCase>(
  {
    veteranId: {
      type: Schema.Types.ObjectId,
      ref: "VeteranProfile",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed"] as const,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expectedEndDate: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const ReintegrationCase: Model<IReintegrationCase> =
  (mongoose.models.ReintegrationCase as Model<IReintegrationCase>) ??
  mongoose.model<IReintegrationCase>("ReintegrationCase", ReintegrationCaseSchema);

export default ReintegrationCase;
