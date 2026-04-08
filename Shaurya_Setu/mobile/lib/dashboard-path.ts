import type { Href } from "expo-router";

export function dashboardPathForRole(role: string): Href {
	const slug =
		role === "veteran"
			? "veteran"
			: role === "employer"
				? "employer"
				: role === "counsellor"
					? "counsellor"
					: "admin";
	return `/dashboard/${slug}` as Href;
}
