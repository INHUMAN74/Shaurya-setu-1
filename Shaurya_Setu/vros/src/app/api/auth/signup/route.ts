import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { connectDB } from "../../../../../lib/db";
import User from "../../../../../models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    if (!["veteran", "employer", "counsellor"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const hashedPassword = hashSync(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error) {
      if (error.name === "MongoServerError" && (error as { code?: number }).code === 11000) {
        return NextResponse.json(
          { success: false, error: "Email already registered" },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
