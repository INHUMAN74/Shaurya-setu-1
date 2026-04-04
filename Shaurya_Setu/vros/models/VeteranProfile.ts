import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IVeteranProfile extends Document {
  userId: Types.ObjectId;
  fullName: string;
  serviceNumber: string;
  branch: string;
  yearsOfService: number;
  dischargeType: string;
  verified: boolean;
  /** Demo: last "uploaded" document filename (no real file storage). */
  verificationDocumentName?: string;
  createdAt: Date;
}

const VeteranProfileSchema = new Schema<IVeteranProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    serviceNumber: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    yearsOfService: {
      type: Number,
      required: true,
    },
    dischargeType: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationDocumentName: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const VeteranProfile: Model<IVeteranProfile> =
  (mongoose.models.VeteranProfile as Model<IVeteranProfile>) ??
  mongoose.model<IVeteranProfile>("VeteranProfile", VeteranProfileSchema);

export default VeteranProfile;
