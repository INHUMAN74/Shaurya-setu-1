import { NextRequest, NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import { encode } from "next-auth/jwt";
import { connectDB } from "../../../../../../lib/db";
import User from "../../../../../../models/User";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
		const password = typeof body?.password === "string" ? body.password : "";

		if (!email || !password) {
			return NextResponse.json(
				{ success: false, error: "Email and password are required" },
				{ status: 400 },
			);
		}

		const secret = process.env.NEXTAUTH_SECRET;
		if (!secret) {
			return NextResponse.json({ success: false, error: "Server misconfigured" }, { status: 500 });
		}

		await connectDB();
		const user = await User.findOne({ email }).lean();
		if (!user || !user.isActive) {
			return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
		}
		if (!compareSync(password, user.password)) {
			return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
		}

		const id = String(user._id);
		const token = await encode({
			token: {
				sub: id,
				id,
				email: user.email,
				role: user.role,
			},
			secret,
			maxAge: 30 * 24 * 60 * 60,
		});

		return NextResponse.json({
			success: true,
			token,
			user: { id, email: user.email, role: user.role },
		});
	} catch (e) {
		console.error("Mobile login error:", e);
		return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
	}
}
