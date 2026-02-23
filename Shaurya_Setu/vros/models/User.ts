import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "veteran" | "employer" | "counsellor" | "admin";

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["veteran", "employer", "counsellor", "admin"] as const,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ?? mongoose.model<IUser>("User", UserSchema);

export default User;
