import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import ReintegrationCase from "../../../../../models/ReintegrationCase";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user.role !== "counsellor" && session.user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["active", "paused", "completed"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    await connectDB();
    const updated = await ReintegrationCase.findByIdAndUpdate(
      caseId,
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json({ success: false, error: "Failed to update case" }, { status: 500 });
  }
}
