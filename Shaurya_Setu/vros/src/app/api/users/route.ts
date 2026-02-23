import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const users = await User.find({})
      .select("-password")
      .lean()
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users.map((u) => ({
        id: u._id,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
