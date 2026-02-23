import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import ReintegrationCase from "../../../../../models/ReintegrationCase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    await connectDB();

    const case_ = await ReintegrationCase.findById(caseId)
      .populate("veteranId", "fullName serviceNumber branch verified")
      .lean();

    if (!case_) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: case_._id,
        veteranId: case_.veteranId,
        status: case_.status,
        startDate: case_.startDate,
        expectedEndDate: case_.expectedEndDate,
        createdAt: case_.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch case" },
      { status: 500 }
    );
  }
}
