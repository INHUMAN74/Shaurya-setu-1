/**
 * Demo seed: four users, one veteran profile, one case (3 stages), sample tasks (one assigned to employer).
 * Run from the `vros` folder: `npm run seed:demo`
 * Requires `.env.local` with MONGODB_URI (same as create-user.js).
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["veteran", "employer", "counsellor", "admin"], required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  }
);
const VeteranProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  serviceNumber: { type: String, required: true },
  branch: { type: String, required: true },
  yearsOfService: { type: Number, required: true },
  dischargeType: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const ReintegrationCaseSchema = new mongoose.Schema({
  veteranId: { type: mongoose.Schema.Types.ObjectId, ref: "VeteranProfile", required: true },
  status: { type: String, enum: ["active", "paused", "completed"], required: true },
  startDate: { type: Date, required: true },
  expectedEndDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});
const CaseStageSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: "ReintegrationCase", required: true },
  stageType: { type: String, enum: ["employment", "family", "wellbeing"], required: true },
  status: { type: String, enum: ["pending", "in_progress", "completed"], required: true },
  startedAt: { type: Date },
  completedAt: { type: Date },
});
const CaseTaskSchema = new mongoose.Schema({
  stageId: { type: mongoose.Schema.Types.ObjectId, ref: "CaseStage", required: true },
  title: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dueDate: { type: Date },
  status: { type: String, enum: ["todo", "in_progress", "done"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const VeteranProfile = mongoose.models.VeteranProfile || mongoose.model("VeteranProfile", VeteranProfileSchema);
const ReintegrationCase =
  mongoose.models.ReintegrationCase || mongoose.model("ReintegrationCase", ReintegrationCaseSchema);
const CaseStage = mongoose.models.CaseStage || mongoose.model("CaseStage", CaseStageSchema);
const CaseTask = mongoose.models.CaseTask || mongoose.model("CaseTask", CaseTaskSchema);

const PASSWORD = "demo1234";
const ACCOUNTS = [
  { email: "demo.veteran@shauryasetu.local", role: "veteran" },
  { email: "demo.employer@shauryasetu.local", role: "employer" },
  { email: "demo.counsellor@shauryasetu.local", role: "counsellor" },
  { email: "demo.admin@shauryasetu.local", role: "admin" },
];

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI missing in .env.local");
    process.exit(1);
  }
  console.log("Connecting...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");

  const hash = bcrypt.hashSync(PASSWORD, 10);
  const users = {};
  for (const a of ACCOUNTS) {
    let u = await User.findOne({ email: a.email });
    if (!u) {
      u = await User.create({ email: a.email, password: hash, role: a.role, isActive: true });
      console.log("Created user:", a.email, a.role);
    } else {
      u.password = hash;
      u.role = a.role;
      u.isActive = true;
      await u.save();
      console.log("Updated user:", a.email, a.role);
    }
    users[a.role] = u;
  }

  let profile = await VeteranProfile.findOne({ userId: users.veteran._id });
  if (!profile) {
    profile = await VeteranProfile.create({
      userId: users.veteran._id,
      fullName: "Demo Veteran",
      serviceNumber: "SV-DEMO-001",
      branch: "Army",
      yearsOfService: 12,
      dischargeType: "Honourable",
      verified: true,
    });
    console.log("Created veteran profile.");
  } else {
    profile.verified = true;
    await profile.save();
    console.log("Veteran profile already exists; ensured verified.");
  }

  let reCase = await ReintegrationCase.findOne({ veteranId: profile._id });
  if (!reCase) {
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 6);
    reCase = await ReintegrationCase.create({
      veteranId: profile._id,
      status: "active",
      startDate: start,
      expectedEndDate: end,
    });
    await CaseStage.insertMany([
      { caseId: reCase._id, stageType: "employment", status: "in_progress", startedAt: new Date() },
      { caseId: reCase._id, stageType: "family", status: "pending" },
      { caseId: reCase._id, stageType: "wellbeing", status: "pending" },
    ]);
    console.log("Created case and stages.");
  } else {
    console.log("Case already exists for demo veteran.");
  }

  const stages = await CaseStage.find({ caseId: reCase._id }).lean();
  const employment = stages.find((s) => s.stageType === "employment");
  const family = stages.find((s) => s.stageType === "family");
  if (!employment) {
    console.error("No employment stage found.");
    process.exit(1);
  }

  const existingTasks = await CaseTask.countDocuments({ stageId: employment._id });
  if (existingTasks === 0) {
    const dueSoon = new Date();
    dueSoon.setDate(dueSoon.getDate() + 7);
    await CaseTask.create({
      stageId: employment._id,
      title: "Schedule interview with veteran (employer action)",
      assignedTo: users.employer._id,
      dueDate: dueSoon,
      status: "todo",
    });
    await CaseTask.create({
      stageId: employment._id,
      title: "Share job readiness checklist with counsellor",
      status: "in_progress",
    });
    if (family) {
      await CaseTask.create({
        stageId: family._id,
        title: "Family check-in call — week 1",
        status: "todo",
      });
    }
    console.log("Created demo tasks (one assigned to employer).");
  } else {
    console.log("Tasks already exist on employment stage; skipped task creation.");
  }

  console.log("\n--- Demo login (password for all):", PASSWORD, "---");
  for (const a of ACCOUNTS) {
    console.log(a.role.padEnd(12), a.email);
  }
  console.log("\nFlow: sign in as counsellor to view case; sign in as employer to complete assigned task.");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
