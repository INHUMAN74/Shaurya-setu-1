import { type Href, Link, router, usePathname } from "expo-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";
import { dashboardPathForRole } from "@/lib/dashboard-path";

const ROLE_LABELS: Record<string, string> = {
	veteran: "Veteran",
	employer: "Employer",
	counsellor: "Counsellor",
	admin: "Admin",
};

const ROLE_HOME: Record<string, string> = {
	veteran: "/dashboard/veteran",
	employer: "/dashboard/employer",
	counsellor: "/dashboard/counsellor",
	admin: "/dashboard/admin",
};

const ROLE_NAV: Record<string, { href: string; label: string }[]> = {
	veteran: [
		{ href: "/dashboard/veteran", label: "Dashboard" },
		{ href: "/dashboard/veteran/profile", label: "My profile" },
		{ href: "/dashboard/veteran/plan", label: "My plan" },
	],
	employer: [{ href: "/dashboard/employer", label: "Dashboard" }],
	counsellor: [
		{ href: "/dashboard/counsellor", label: "Dashboard" },
		{ href: "/dashboard/counsellor/veterans", label: "Veterans" },
		{ href: "/dashboard/counsellor/cases", label: "Cases" },
	],
	admin: [
		{ href: "/dashboard/admin", label: "Dashboard" },
		{ href: "/dashboard/admin/users", label: "Users" },
		{ href: "/dashboard/admin/verification", label: "Verification" },
	],
};

function navActive(pathname: string, href: string, homeHref: string) {
	if (pathname === href) return true;
	if (href === homeHref) return false;
	return pathname.startsWith(`${href}/`);
}

export default function DashboardShell({
	title,
	children,
}: {
	title?: string;
	children: ReactNode;
}) {
	const pathname = usePathname();
	const { user, signOut } = useAuth();
	const role = user?.role ?? "veteran";
	const navItems = ROLE_NAV[role] ?? [];
	const homeHref = ROLE_HOME[role] ?? "/dashboard/veteran";

	useEffect(() => {
		if (!user?.role) return;
		const r = user.role;
		const prefix =
			r === "veteran"
				? "/dashboard/veteran"
				: r === "employer"
					? "/dashboard/employer"
					: r === "counsellor"
						? "/dashboard/counsellor"
						: "/dashboard/admin";
		if (!pathname.startsWith(prefix)) {
			router.replace(dashboardPathForRole(r));
		}
	}, [pathname, user?.role]);

	return (
		<SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
			<View style={styles.header}>
				<Link href={homeHref as Href} asChild>
					<Pressable>
						<Text style={styles.logo}>Shaurya Setu</Text>
					</Pressable>
				</Link>
				<Pressable onPress={() => signOut()} style={styles.outBtn}>
					<Text style={styles.outTxt}>Sign out</Text>
				</Pressable>
			</View>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navScroll}>
				{navItems.map((item) => {
					const active = navActive(pathname, item.href, homeHref);
					return (
						<Link key={item.href} href={item.href as Href} asChild>
							<Pressable style={[styles.navItem, active && styles.navItemOn]}>
								<Text style={[styles.navText, active && styles.navTextOn]}>{item.label}</Text>
							</Pressable>
						</Link>
					);
				})}
			</ScrollView>
			<View style={styles.userBar}>
				<Text style={styles.userEmail} numberOfLines={1}>
					{user?.email}
				</Text>
				<Text style={styles.userRole}>{ROLE_LABELS[role] ?? role}</Text>
			</View>
			{title ? <Text style={styles.pageTitle}>{title}</Text> : null}
			<ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
				{children}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: "#fafafa" },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#e4e4e7",
		backgroundColor: "#fff",
	},
	logo: { fontSize: 18, fontWeight: "800", color: "#18181b" },
	outBtn: { paddingVertical: 6, paddingHorizontal: 10 },
	outTxt: { fontSize: 14, fontWeight: "600", color: "#dc2626" },
	navScroll: {
		maxHeight: 48,
		borderBottomWidth: 1,
		borderBottomColor: "#e4e4e7",
		backgroundColor: "#fff",
	},
	navItem: { paddingHorizontal: 14, paddingVertical: 12, marginRight: 4 },
	navItemOn: { borderBottomWidth: 2, borderBottomColor: "#18181b" },
	navText: { fontSize: 14, fontWeight: "500", color: "#71717a" },
	navTextOn: { color: "#18181b", fontWeight: "700" },
	userBar: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#f4f4f5" },
	userEmail: { fontSize: 12, color: "#3f3f46", fontWeight: "500" },
	userRole: { fontSize: 11, color: "#71717a", marginTop: 2 },
	pageTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#18181b",
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 4,
	},
	body: { flex: 1 },
	bodyContent: { padding: 16, paddingBottom: 40 },
});
