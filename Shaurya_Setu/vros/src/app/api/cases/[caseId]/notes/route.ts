import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import { connectDB } from "../../../../../../lib/db";
import ReintegrationCase from "../../../../../../models/ReintegrationCase";
import VeteranProfile from "../../../../../../models/VeteranProfile";
import CaseNote from "../../../../../../models/CaseNote";

type SessionWithUser = NonNullable<Awaited<ReturnType<typeof getServerSession>>> & {
  user: { id: string; role: string };
};

async function canAccessCase(session: SessionWithUser, caseId: string): Promise<"full" | "none" | "veteran_read"> {
  await connectDB();
  const case_ = await ReintegrationCase.findById(caseId).lean();
  if (!case_) return "none";

  const role = session.user.role;
  if (role === "counsellor" || role === "admin") return "full";

  if (role === "veteran") {
    const profile = await VeteranProfile.findOne({ userId: session.user.id }).lean();
    if (profile && String(profile._id) === String(case_.veteranId)) return "veteran_read";
  }

  return "none";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = await params;
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json({ success: false, error: "Invalid case id" }, { status: 400 });
    }

    const access = await canAccessCase(session as SessionWithUser, caseId);
    if (access === "none") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const notes = await CaseNote.find({ caseId })
      .populate("authorId", "email role")
      .lean()
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: notes.map((n) => ({
        id: n._id,
        caseId: n.caseId,
        body: n.body,
        createdAt: n.createdAt,
        author: n.authorId,
      })),
    });
  } catch (error) {
    console.error("Error fetching case notes:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const s = session as SessionWithUser;
    const role = s.user.role;
    if (role !== "counsellor" && role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { caseId } = await params;
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json({ success: false, error: "Invalid case id" }, { status: 400 });
    }

    const body = await request.json();
    const text = typeof body?.body === "string" ? body.body.trim() : "";
    if (!text) {
      return NextResponse.json({ success: false, error: "body is required" }, { status: 400 });
    }

    await connectDB();
    const case_ = await ReintegrationCase.findById(caseId);
    if (!case_) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    const note = await CaseNote.create({
      caseId,
      authorId: s.user.id,
      body: text,
    });

    const populated = await CaseNote.findById(note._id).populate("authorId", "email role").lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          id: populated!._id,
          caseId: populated!.caseId,
          body: populated!.body,
          createdAt: populated!.createdAt,
          author: populated!.authorId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating case note:", error);
    return NextResponse.json({ success: false, error: "Failed to create note" }, { status: 500 });
  }
}
