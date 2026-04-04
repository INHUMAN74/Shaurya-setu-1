import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import CaseTask from "../../../../models/CaseTask";
import CaseStage from "../../../../models/CaseStage";

const REQUIRED_FIELDS = ["stageId", "title"] as const;

function validateRequestBody(body: unknown): { valid: boolean; data?: Record<string, unknown>; error?: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const data = body as Record<string, unknown>;
  const missing: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(", ")}` };
  }

  if (typeof data.title !== "string" || data.title.trim().length === 0) {
    return { valid: false, error: "title must be a non-empty string" };
  }

  const status = data.status as string | undefined;
  if (status !== undefined && !["todo", "in_progress", "done"].includes(status)) {
    return { valid: false, error: "status must be todo, in_progress, or done" };
  }

  const dueDate = data.dueDate;
  if (dueDate !== undefined && dueDate !== null) {
    const parsed = new Date(dueDate as string);
    if (Number.isNaN(parsed.getTime())) {
      return { valid: false, error: "dueDate must be a valid date" };
    }
  }

  if (data.stageId !== undefined && !mongoose.Types.ObjectId.isValid(data.stageId as string)) {
    return { valid: false, error: "stageId must be a valid ObjectId" };
  }

  if (data.assignedTo !== undefined && !mongoose.Types.ObjectId.isValid(data.assignedTo as string)) {
    return { valid: false, error: "assignedTo must be a valid ObjectId string or omitted" };
  }

  return { valid: true, data };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const assignedTo = searchParams.get("assignedTo");
    const stageId = searchParams.get("stageId");

    let query: Record<string, unknown> = {};
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (stageId) {
      query.stageId = stageId;
    }

    const tasks = await CaseTask.find(query)
      .populate("stageId", "stageType caseId")
      .populate({
        path: "stageId",
        populate: { path: "caseId", populate: { path: "veteranId", select: "fullName" } },
      })
      .lean()
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: tasks.map((t) => ({
        id: t._id,
        stageId: t.stageId,
        title: t.title,
        assignedTo: t.assignedTo,
        dueDate: t.dueDate,
        status: t.status,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user.role !== "counsellor" && session.user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateRequestBody(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    await connectDB();

    const { stageId, title, assignedTo, dueDate } = validation.data!;
    const status = (validation.data!.status as string) ?? "todo";

    const stage = await CaseStage.findById(stageId);
    if (!stage) {
      return NextResponse.json(
        { success: false, error: "Stage not found" },
        { status: 404 }
      );
    }

    const task = await CaseTask.create({
      stageId: stageId as string,
      title: (title as string).trim(),
      assignedTo: assignedTo as string | undefined,
      dueDate: dueDate ? new Date(dueDate as string) : undefined,
      status: status as "todo" | "in_progress" | "done",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: task._id,
          stageId: task.stageId,
          title: task.title,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          status: task.status,
          createdAt: task.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);

    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}
