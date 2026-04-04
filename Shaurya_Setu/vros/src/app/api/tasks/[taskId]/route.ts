import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { connectDB } from "../../../../../lib/db";
import CaseTask from "../../../../../models/CaseTask";

const ALLOWED_STATUS = ["todo", "in_progress", "done"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ success: false, error: "Invalid task id" }, { status: 400 });
    }

    const body = await request.json();
    const status = body?.status as string | undefined;
    if (!status || !ALLOWED_STATUS.includes(status as (typeof ALLOWED_STATUS)[number])) {
      return NextResponse.json(
        { success: false, error: "status must be todo, in_progress, or done" },
        { status: 400 }
      );
    }

    await connectDB();
    const task = await CaseTask.findById(taskId).lean();
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const assigneeId = task.assignedTo ? String(task.assignedTo) : "";
    const isAssignee = assigneeId === session.user.id;
    const isStaff = session.user.role === "counsellor" || session.user.role === "admin";
    if (!isAssignee && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const updated = await CaseTask.findByIdAndUpdate(
      taskId,
      { status: status as "todo" | "in_progress" | "done" },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated._id,
        stageId: updated.stageId,
        title: updated.title,
        assignedTo: updated.assignedTo,
        dueDate: updated.dueDate,
        status: updated.status,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}
