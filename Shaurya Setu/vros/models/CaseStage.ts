import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type StageType = "employment" | "family" | "wellbeing";
export type StageStatus = "pending" | "in_progress" | "completed";

export interface ICaseStage extends Document {
  caseId: Types.ObjectId;
  stageType: StageType;
  status: StageStatus;
  startedAt?: Date;
  completedAt?: Date;
}

const CaseStageSchema = new Schema<ICaseStage>(
  {
    caseId: {
      type: Schema.Types.ObjectId,
      ref: "ReintegrationCase",
      required: true,
    },
    stageType: {
      type: String,
      enum: ["employment", "family", "wellbeing"] as const,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"] as const,
      required: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  }
);

const CaseStage: Model<ICaseStage> =
  (mongoose.models.CaseStage as Model<ICaseStage>) ??
  mongoose.model<ICaseStage>("CaseStage", CaseStageSchema);

export default CaseStage;
