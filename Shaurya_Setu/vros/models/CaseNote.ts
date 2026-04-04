import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICaseNote extends Document {
  caseId: Types.ObjectId;
  authorId: Types.ObjectId;
  body: string;
  createdAt: Date;
}

const CaseNoteSchema = new Schema<ICaseNote>(
  {
    caseId: {
      type: Schema.Types.ObjectId,
      ref: "ReintegrationCase",
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

CaseNoteSchema.index({ caseId: 1, createdAt: -1 });

const CaseNote: Model<ICaseNote> =
  (mongoose.models.CaseNote as Model<ICaseNote>) ?? mongoose.model<ICaseNote>("CaseNote", CaseNoteSchema);

export default CaseNote;
