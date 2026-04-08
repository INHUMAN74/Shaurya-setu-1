import { StyleSheet, Text, View } from "react-native";

export type BarItem = {
	label: string;
	value: number;
	color: string;
};

export default function HorizontalBarChart({
	title,
	items,
}: {
	title: string;
	items: BarItem[];
}) {
	const max = Math.max(...items.map((i) => i.value), 1);

	return (
		<View style={styles.card}>
			<Text style={styles.title}>{title}</Text>
			{items.map((item) => (
				<View key={item.label} style={styles.row}>
					<Text style={styles.label} numberOfLines={1}>
						{item.label}
					</Text>
					<View style={styles.track}>
						<View
							style={[
								styles.fill,
								{ width: `${Math.min(100, (item.value / max) * 100)}%`, backgroundColor: item.color },
							]}
						/>
					</View>
					<Text style={styles.value}>{item.value}</Text>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 16,
		backgroundColor: "#fff",
	},
	title: { fontSize: 16, fontWeight: "700", color: "#18181b", marginBottom: 12 },
	row: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
	label: { width: 100, fontSize: 13, color: "#52525b" },
	track: {
		flex: 1,
		height: 10,
		backgroundColor: "#f4f4f5",
		borderRadius: 4,
		overflow: "hidden",
	},
	fill: { height: "100%", borderRadius: 4 },
	value: { width: 36, textAlign: "right", fontSize: 13, fontWeight: "600", color: "#18181b" },
});
