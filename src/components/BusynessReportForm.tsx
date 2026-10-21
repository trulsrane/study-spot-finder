import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSession } from '@/src/hooks/useSession';
import { useReportBusyness } from '@/src/hooks/useReportBusyness';
import { Busyness } from '@/src/types/db';
import { colors, spacing, type, radius } from '@/src/theme';

// 'unknown' finns i enumen men ska inte gå att rapportera
const options: { level: Busyness; label: string; color: string }[] = [
	{ level: 'low', label: 'Low', color: colors.busynessLow },
	{ level: 'medium', label: 'Medium', color: colors.busynessMedium },
	{ level: 'high', label: 'High', color: colors.busynessHigh },
];

type BusynessReportFormProps = {
	placeId: string;
	onReported?: () => void;
};

export function BusynessReportForm({ placeId, onReported }: BusynessReportFormProps) {
	const userId = useSession()?.user.id;
	const { reportBusyness, saving, error } = useReportBusyness();

	async function handlePress(level: Busyness) {
		if (!userId) {
			Alert.alert('Log in', 'You need to be logged in to report busyness.');
			return;
		}
		const result = await reportBusyness({ place_id: placeId, user_id: userId, level });
		if (result) onReported?.();
	}

	return (
		<View style={styles.container}>
			<Text style={styles.label}>How busy is it right now?</Text>
			<View style={styles.buttonsRow}>
				{options.map((o) => (
					<TouchableOpacity
						key={o.level}
						style={[styles.button, { backgroundColor: o.color }, saving && { opacity: 0.5 }]}
						onPress={() => handlePress(o.level)}
						disabled={saving}
					>
						<Text style={styles.buttonText}>{o.label}</Text>
					</TouchableOpacity>
				))}
			</View>
			{error && <Text style={styles.error}>{error}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { marginTop: spacing.sm },
	label: { ...type.caption, color: colors.textMuted, marginBottom: spacing.xs },
	buttonsRow: { flexDirection: 'row', gap: spacing.sm },
	button: {
		borderRadius: radius.pill,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
	},
	buttonText: {
		color: colors.text,
		fontSize: type.buttonText.fontSize,
		fontWeight: type.buttonText.fontWeight,
	},
	error: { ...type.caption, color: 'red', marginTop: spacing.xs },
});
