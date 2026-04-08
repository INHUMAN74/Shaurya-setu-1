import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../../../lib/db";
import CaseStage from "../../../../../../../models/CaseStage";
import { getAppSession } from "../../../../../../../lib/get-app-session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; stageId: string }> }
) {
  try {
    const session = await getAppSession(request);
    if (!session?.user?.id || (session.user.role !== "counsellor" && session.user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { stageId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["pending", "in_progress", "completed"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    await connectDB();
    const updateData: any = { status };
    if (status === "in_progress") {
      updateData.startedAt = new Date();
    } else if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const updated = await CaseStage.findByIdAndUpdate(stageId, updateData, { new: true }).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Stage not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating stage:", error);
    return NextResponse.json({ success: false, error: "Failed to update stage" }, { status: 500 });
  }
}
