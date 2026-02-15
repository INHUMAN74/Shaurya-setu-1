import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import VeteranProfile from "../../../../models/VeteranProfile";

const REQUIRED_FIELDS = ["userId", "fullName", "serviceNumber", "branch", "yearsOfService", "dischargeType"] as const;

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

  const yearsOfService = Number(data.yearsOfService);
  if (Number.isNaN(yearsOfService) || yearsOfService < 0) {
    return { valid: false, error: "yearsOfService must be a non-negative number" };
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

    const veteranProfile = await VeteranProfile.create({
      userId: validation.data!.userId,
      fullName: validation.data!.fullName,
      serviceNumber: validation.data!.serviceNumber,
      branch: validation.data!.branch,
      yearsOfService: Number(validation.data!.yearsOfService),
      dischargeType: validation.data!.dischargeType,
      verified: validation.data!.verified ?? false,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: veteranProfile._id,
          userId: veteranProfile.userId,
          fullName: veteranProfile.fullName,
          serviceNumber: veteranProfile.serviceNumber,
          branch: veteranProfile.branch,
          yearsOfService: veteranProfile.yearsOfService,
          dischargeType: veteranProfile.dischargeType,
          verified: veteranProfile.verified,
          createdAt: veteranProfile.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating veteran profile:", error);

    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      if (error.name === "MongoServerError" && (error as { code?: number }).code === 11000) {
        return NextResponse.json(
          { success: false, error: "A profile already exists for this user" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to create veteran profile" },
      { status: 500 }
    );
  }
}
