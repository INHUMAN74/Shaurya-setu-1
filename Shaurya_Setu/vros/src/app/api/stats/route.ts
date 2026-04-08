import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "../../../../lib/get-app-session";
import { connectDB } from "../../../../lib/db";
import VeteranProfile from "../../../../models/VeteranProfile";
import ReintegrationCase from "../../../../models/ReintegrationCase";
import CaseTask from "../../../../models/CaseTask";
import User from "../../../../models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getAppSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "counsellor" && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const now = new Date();

    let usersByRole: Record<string, number> | null = null;
    if (session.user.role === "admin") {
      const users = await User.find({}).select("role").lean();
      usersByRole = {};
      for (const u of users) {
        const r = u.role as string;
        usersByRole[r] = (usersByRole[r] || 0) + 1;
      }
    }

    const [veteranCount, activeCases, pausedCases, completedCases, overdueTasks] = await Promise.all([
      VeteranProfile.countDocuments({}),
      ReintegrationCase.countDocuments({ status: "active" }),
      ReintegrationCase.countDocuments({ status: "paused" }),
      ReintegrationCase.countDocuments({ status: "completed" }),
      CaseTask.countDocuments({
        dueDate: { $lt: now },
        status: { $ne: "done" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        veteranCount,
        cases: { active: activeCases, paused: pausedCases, completed: completedCases },
        overdueTaskCount: overdueTasks,
        usersByRole,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
