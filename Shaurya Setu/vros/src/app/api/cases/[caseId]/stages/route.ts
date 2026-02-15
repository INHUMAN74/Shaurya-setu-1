import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import CaseStage from "../../../../../models/CaseStage";
import CaseTask from "../../../../../models/CaseTask";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: "Case ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const stages = await CaseStage.find({ caseId }).lean();
    const stageIds = stages.map((s) => s._id);

    const tasks = await CaseTask.find({ stageId: { $in: stageIds } }).lean();

    const stagesWithTasks = stages.map((stage) => ({
      id: stage._id,
      caseId: stage.caseId,
      stageType: stage.stageType,
      status: stage.status,
      startedAt: stage.startedAt,
      completedAt: stage.completedAt,
      tasks: tasks
        .filter((t) => String(t.stageId) === String(stage._id))
        .map((t) => ({
          id: t._id,
          stageId: t.stageId,
          title: t.title,
          assignedTo: t.assignedTo,
          dueDate: t.dueDate,
          status: t.status,
          createdAt: t.createdAt,
        })),
    }));

    return NextResponse.json({
      success: true,
      data: stagesWithTasks,
    });
  } catch (error) {
    console.error("Error fetching case stages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch case stages" },
      { status: 500 }
    );
  }
}
