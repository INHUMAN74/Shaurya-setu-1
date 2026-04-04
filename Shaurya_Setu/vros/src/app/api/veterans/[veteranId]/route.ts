import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
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
        verificationDocumentName: veteran.verificationDocumentName ?? "",
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ veteranId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { veteranId } = await params;
    if (!mongoose.Types.ObjectId.isValid(veteranId)) {
      return NextResponse.json({ success: false, error: "Invalid veteran id" }, { status: 400 });
    }

    const body = await request.json();
    const docName =
      typeof body?.verificationDocumentName === "string" ? body.verificationDocumentName.trim().slice(0, 500) : undefined;

    if (docName === undefined) {
      return NextResponse.json(
        { success: false, error: "verificationDocumentName is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const profile = await VeteranProfile.findById(veteranId);
    if (!profile) {
      return NextResponse.json({ success: false, error: "Veteran not found" }, { status: 404 });
    }

    const role = session.user.role;
    const isOwner = String(profile.userId) === session.user.id;
    const isStaff = role === "admin" || role === "counsellor";
    if (!isOwner && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    profile.verificationDocumentName = docName;
    await profile.save();

    return NextResponse.json({
      success: true,
      data: {
        id: profile._id,
        verificationDocumentName: profile.verificationDocumentName,
      },
    });
  } catch (error) {
    console.error("Error updating veteran:", error);
    return NextResponse.json({ success: false, error: "Failed to update veteran" }, { status: 500 });
  }
}
