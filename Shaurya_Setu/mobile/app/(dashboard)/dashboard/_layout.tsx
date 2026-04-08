import { Stack } from "expo-router";

import { AuthGate } from "@/components/AuthGate";

export default function DashboardStackLayout() {
	return (
		<AuthGate>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			/>
		</AuthGate>
	);
}
