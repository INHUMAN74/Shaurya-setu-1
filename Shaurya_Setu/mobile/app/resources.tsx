import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/** Same sections as vros `src/app/resources/page.tsx` */
const SECTIONS = [
	{
		title: "Mental health & crisis",
		items: [
			{
				name: "Kiran Mental Health Helpline",
				detail: "9152987821 · 24×7 tele-mental health support",
				href: "tel:9152987821",
			},
			{
				name: "Vandrevala Foundation",
				detail: "Crisis helpline — search current national numbers for your region.",
				href: "https://www.google.com/search?q=vandrevala+foundation+helpline",
			},
		],
	},
	{
		title: "Employment & skills",
		items: [
			{
				name: "National Career Service (India)",
				detail: "Job matching, career guidance, skill courses.",
				href: "https://www.ncs.gov.in/",
			},
			{
				name: "Skill India / NSDC",
				detail: "Training and certification pathways.",
				href: "https://www.skillindia.gov.in/",
			},
		],
	},
	{
		title: "Veterans & ex-servicemen welfare",
		items: [
			{
				name: "Indian Army — Veterans",
				detail: "Official information and welfare pointers.",
				href: "https://indianarmy.nic.in/",
			},
			{
				name: "MyGov — schemes & updates",
				detail: "Central government programmes (verify eligibility locally).",
				href: "https://www.mygov.in/",
			},
		],
	},
];

async function openHref(href: string) {
	if (href.startsWith("tel:")) {
		const can = await Linking.canOpenURL(href);
		if (can) await Linking.openURL(href);
		return;
	}
	if (href.startsWith("http")) await WebBrowser.openBrowserAsync(href);
}

export default function ResourcesScreen() {
	return (
		<ScrollView style={styles.root} contentContainerStyle={styles.content}>
			<View style={styles.header}>
				<View style={styles.brand}>
					<View style={styles.logo}>
						<Text style={styles.logoText}>SS</Text>
					</View>
					<Text style={styles.brandTitle}>Shaurya Setu</Text>
				</View>
				<Link href="/" asChild>
					<Pressable>
						<Text style={styles.navLink}>Home</Text>
					</Pressable>
				</Link>
			</View>

			<Text style={styles.h1}>Resources</Text>
			<Text style={styles.intro}>
				Curated pointers for awareness and support. Shaurya Setu does not endorse or operate these services—use
				official channels and local guidance for eligibility and emergencies.
			</Text>

			{SECTIONS.map((section) => (
				<View key={section.title} style={styles.section}>
					<Text style={styles.sectionTitle}>{section.title}</Text>
					<View style={styles.card}>
						{section.items.map((item, i) => (
							<Pressable
								key={item.name}
								style={[styles.row, i > 0 && styles.rowBorder]}
								onPress={() => openHref(item.href)}
							>
								<Text style={styles.itemName}>{item.name}</Text>
								<Text style={styles.itemDetail}>{item.detail}</Text>
							</Pressable>
						))}
					</View>
				</View>
			))}

			<Link href="/" asChild>
				<Pressable style={styles.footerLink}>
					<Text style={styles.muted}>← Back to home</Text>
				</Pressable>
			</Link>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: "#fafafa" },
	content: { paddingBottom: 32 },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 16,
		paddingHorizontal: 4,
		borderBottomWidth: 1,
		borderBottomColor: "#e4e4e7",
		marginBottom: 20,
	},
	brand: { flexDirection: "row", alignItems: "center", gap: 8 },
	logo: {
		width: 36,
		height: 36,
		borderRadius: 8,
		backgroundColor: "#ea580c",
		alignItems: "center",
		justifyContent: "center",
	},
	logoText: { color: "#fff", fontWeight: "800", fontSize: 12 },
	brandTitle: { fontSize: 18, fontWeight: "700", color: "#18181b" },
	navLink: { fontSize: 14, fontWeight: "600", color: "#52525b" },
	h1: { fontSize: 28, fontWeight: "800", color: "#18181b" },
	intro: { marginTop: 10, fontSize: 14, lineHeight: 22, color: "#52525b" },
	section: { marginTop: 28 },
	sectionTitle: { fontSize: 17, fontWeight: "700", color: "#18181b" },
	card: {
		marginTop: 12,
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		backgroundColor: "#fff",
		overflow: "hidden",
	},
	row: { padding: 16 },
	rowBorder: { borderTopWidth: 1, borderTopColor: "#e4e4e7" },
	itemName: { fontSize: 16, fontWeight: "600", color: "#18181b" },
	itemDetail: { marginTop: 6, fontSize: 14, color: "#52525b", lineHeight: 20 },
	footerLink: { marginTop: 28, alignItems: "center" },
	muted: { fontSize: 14, color: "#71717a" },
});
