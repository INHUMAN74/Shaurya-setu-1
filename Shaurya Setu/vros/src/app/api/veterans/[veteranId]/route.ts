import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import VeteranProfile from "../../../../../models/VeteranProfile";
import ReintegrationCase from "../../../../../models/ReintegrationCase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ veteranId: string }> }
) {
  try {
    const { veteranId } = await params;
    await connectDB();

    const veteran = await VeteranProfile.findById(veteranId)
      .populate("userId", "email role")
      .lean();

    if (!veteran) {
      return NextResponse.json(
        { success: false, error: "Veteran not found" },
        { status: 404 }
      );
    }

    const case_ = await ReintegrationCase.findOne({ veteranId }).lean();

    return NextResponse.json({
      success: true,
      data: {
        id: veteran._id,
        userId: veteran.userId,
        fullName: veteran.fullName,
        serviceNumber: veteran.serviceNumber,
        branch: veteran.branch,
        yearsOfService: veteran.yearsOfService,
        dischargeType: veteran.dischargeType,
        verified: veteran.verified,
        createdAt: veteran.createdAt,
        hasCase: !!case_,
        caseId: case_?._id,
      },
    });
  } catch (error) {
    console.error("Error fetching veteran:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch veteran" },
      { status: 500 }
    );
  }
}
