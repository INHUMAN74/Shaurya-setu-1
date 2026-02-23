import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/db";
import ReintegrationCase from "../../../../models/ReintegrationCase";
import CaseStage from "../../../../models/CaseStage";

const REQUIRED_FIELDS = ["veteranId", "startDate", "expectedEndDate"] as const;
const STAGE_TYPES = ["employment", "family", "wellbeing"] as const;

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

  const startDate = new Date(data.startDate as string);
  const expectedEndDate = new Date(data.expectedEndDate as string);

  if (Number.isNaN(startDate.getTime())) {
    return { valid: false, error: "startDate must be a valid date" };
  }
  if (Number.isNaN(expectedEndDate.getTime())) {
    return { valid: false, error: "expectedEndDate must be a valid date" };
  }
  if (expectedEndDate < startDate) {
    return { valid: false, error: "expectedEndDate must be after startDate" };
  }

  if (data.veteranId !== undefined && !mongoose.Types.ObjectId.isValid(data.veteranId as string)) {
    return { valid: false, error: "veteranId must be a valid ObjectId" };
  }

  const status = data.status as string | undefined;
  if (status !== undefined && !["active", "paused", "completed"].includes(status)) {
    return { valid: false, error: "status must be active, paused, or completed" };
  }

  return { valid: true, data };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const veteranId = searchParams.get("veteranId");
    const status = searchParams.get("status");

    let query: Record<string, unknown> = {};
    if (veteranId) {
      query.veteranId = veteranId;
    }
    if (status) {
      query.status = status;
    }

    const cases = await ReintegrationCase.find(query)
      .populate("veteranId", "fullName serviceNumber branch")
      .lean()
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: cases.map((c) => ({
        id: c._id,
        veteranId: c.veteranId,
        status: c.status,
        startDate: c.startDate,
        expectedEndDate: c.expectedEndDate,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
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

    const { veteranId, startDate, expectedEndDate } = validation.data!;
    const status = (validation.data!.status as string) ?? "active";

    const reintegrationCase = await ReintegrationCase.create({
      veteranId: veteranId as string,
      status: status as "active" | "paused" | "completed",
      startDate: new Date(startDate as string),
      expectedEndDate: new Date(expectedEndDate as string),
    });

    const stages = await CaseStage.insertMany(
      STAGE_TYPES.map((stageType) => ({
        caseId: reintegrationCase._id,
        stageType,
        status: "pending",
      }))
    );

    const caseWithStages = await ReintegrationCase.findById(reintegrationCase._id)
      .populate("veteranId")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          ...caseWithStages,
          stages: stages.map((s) => ({
            id: s._id,
            caseId: s.caseId,
            stageType: s.stageType,
            status: s.status,
            startedAt: s.startedAt,
            completedAt: s.completedAt,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reintegration case:", error);

    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to create reintegration case" },
      { status: 500 }
    );
  }
}
