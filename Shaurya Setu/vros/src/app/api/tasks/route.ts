import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/db";
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

  return { valid: true, data };
}

export async function POST(request: NextRequest) {
  try {
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
      stageId,
      title: (title as string).trim(),
      assignedTo: assignedTo ?? undefined,
      dueDate: dueDate ? new Date(dueDate as string) : undefined,
      status,
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
