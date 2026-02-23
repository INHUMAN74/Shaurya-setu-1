import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db";
import VeteranProfile from "../../../../../../models/VeteranProfile";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ veteranId: string }> }
) {
  try {
    const { veteranId } = await params;
    await connectDB();

    const veteran = await VeteranProfile.findByIdAndUpdate(
      veteranId,
      { verified: true },
      { new: true }
    ).lean();

    if (!veteran) {
      return NextResponse.json(
        { success: false, error: "Veteran not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: veteran._id,
        verified: veteran.verified,
      },
    });
  } catch (error) {
    console.error("Error verifying veteran:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify veteran" },
      { status: 500 }
    );
  }
}
