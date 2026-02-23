import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { connectDB } from "../../../../lib/db";
import VeteranProfile from "../../../../models/VeteranProfile";

const REQUIRED_FIELDS = ["fullName", "serviceNumber", "branch", "yearsOfService", "dischargeType"] as const;

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

  if (data.userId !== undefined && data.userId !== null && !mongoose.Types.ObjectId.isValid(data.userId as string)) {
    return { valid: false, error: "userId must be a valid ObjectId" };
  }

  return { valid: true, data };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const verified = searchParams.get("verified");
    const userId = searchParams.get("userId");

    let query: Record<string, unknown> = {};
    if (userId) {
      query.userId = userId;
    }
    if (search) {
      query = {
        ...query,
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { serviceNumber: { $regex: search, $options: "i" } },
        ],
      };
    }
    if (verified !== null) {
      query.verified = verified === "true";
    }

    const veterans = await VeteranProfile.find(query)
      .populate("userId", "email role")
      .lean()
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: veterans.map((v) => ({
        id: v._id,
        userId: v.userId,
        fullName: v.fullName,
        serviceNumber: v.serviceNumber,
        branch: v.branch,
        yearsOfService: v.yearsOfService,
        dischargeType: v.dischargeType,
        verified: v.verified,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching veterans:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch veterans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
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

    // If user is a veteran, use their session userId. Otherwise (admin/counsellor), use userId from body if provided
    let userId: string;
    if (session.user.role === "veteran") {
      userId = session.user.id;
    } else {
      userId = (validation.data!.userId as string) || session.user.id;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 }
      );
    }

    const veteranProfile = await VeteranProfile.create({
      userId,
      fullName: validation.data!.fullName as string,
      serviceNumber: validation.data!.serviceNumber as string,
      branch: validation.data!.branch as string,
      yearsOfService: Number(validation.data!.yearsOfService),
      dischargeType: validation.data!.dischargeType as string,
      verified: (validation.data!.verified as boolean) ?? false,
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
