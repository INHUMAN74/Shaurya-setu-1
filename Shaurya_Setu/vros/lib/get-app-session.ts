import type { NextRequest } from "next/server";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { decode } from "next-auth/jwt";
import { authOptions } from "./auth";
import type { UserRole } from "../models/User";

/**
 * Session for API routes: cookie session (web) or `Authorization: Bearer` (Expo).
 */
export async function getAppSession(req: NextRequest): Promise<Session | null> {
	const secret = process.env.NEXTAUTH_SECRET;
	const auth = req.headers.get("authorization");

	if (auth?.startsWith("Bearer ")) {
		if (!secret) return null;
		const raw = auth.slice(7);
		const payload = await decode({ token: raw, secret });
		if (
			payload &&
			typeof payload.email === "string" &&
			typeof payload.role === "string" &&
			(typeof payload.id === "string" || typeof payload.sub === "string")
		) {
			const id = String(payload.id ?? payload.sub);
			const expSec = typeof payload.exp === "number" ? payload.exp : null;
			const expires = expSec
				? new Date(expSec * 1000).toISOString()
				: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
			return {
				user: {
					id,
					email: payload.email,
					role: payload.role as UserRole,
				},
				expires,
			};
		}
		return null;
	}

	return getServerSession(authOptions);
}
