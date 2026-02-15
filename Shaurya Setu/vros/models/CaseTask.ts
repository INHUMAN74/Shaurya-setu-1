import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface ICaseTask extends Document {
  stageId: Types.ObjectId;
  title: string;
  assignedTo?: Types.ObjectId;
  dueDate?: Date;
  status: TaskStatus;
  createdAt: Date;
}

const CaseTaskSchema = new Schema<ICaseTask>(
  {
    stageId: {
      type: Schema.Types.ObjectId,
      ref: "CaseStage",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"] as const,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const CaseTask: Model<ICaseTask> =
  (mongoose.models.CaseTask as Model<ICaseTask>) ??
  mongoose.model<ICaseTask>("CaseTask", CaseTaskSchema);

export default CaseTask;
