import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PopularTime } from '@/src/types/db';
import { colors, radius, spacing, type } from '@/src/theme';

// Veckodagarna i samma ordning som databasen (isodow: 1 = måndag, 7 = söndag)
const DAYS = [
	{ weekday: 1, short: 'Mon', long: 'Mondays' },
	{ weekday: 2, short: 'Tue', long: 'Tuesdays' },
	{ weekday: 3, short: 'Wed', long: 'Wednesdays' },
	{ weekday: 4, short: 'Thu', long: 'Thursdays' },
	{ weekday: 5, short: 'Fri', long: 'Fridays' },
	{ weekday: 6, short: 'Sat', long: 'Saturdays' },
	{ weekday: 7, short: 'Sun', long: 'Sundays' },
];

// Timmarna som visas i diagrammet, 07–23
const FIRST_HOUR = 7;
const LAST_HOUR = 23;
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i);
const HOUR_LABELS = [9, 12, 15, 18, 21];

const CHART_HEIGHT = 90;
const EMPTY_BAR_HEIGHT = 4;
// Så här många rapporter behöver en dag ha innan vi visar något, annars säger diagrammet ingenting
const MIN_REPORTS_PER_DAY = 3;

// Snittet ligger mellan 1 (low) och 3 (high), färgen följer prickarna på kartan
function barColor(avgLevel: number) {
	if (avgLevel < 1.67) return colors.busynessDotLow;
	if (avgLevel < 2.34) return colors.busynessDotMedium;
	return colors.busynessDotHigh;
}

// JS räknar söndag som 0, databasen som 7
function todayWeekday() {
	return new Date().getDay() || 7;
}

type Props = {
	popularTimes: PopularTime[];
};

// Stapeldiagram över hur fullt det brukar vara under dagen, som "Populära tider" i Google Maps
export function PopularTimesChart({ popularTimes }: Props) {
	const [weekday, setWeekday] = useState(todayWeekday);
	const isToday = weekday === todayWeekday();
	const currentHour = new Date().getHours();

	const forDay = popularTimes.filter((p) => p.weekday === weekday);
	const reportCount = forDay.reduce((sum, p) => sum + p.report_count, 0);
	const byHour = new Map(forDay.map((p) => [p.hour, p]));
	const dayName = DAYS.find((d) => d.weekday === weekday)!.long;

	return (
		<View>
			<View style={styles.daysRow}>
				{DAYS.map((d) => {
					const selected = d.weekday === weekday;
					return (
						<TouchableOpacity
							key={d.weekday}
							style={[styles.dayChip, selected && styles.dayChipSelected]}
							onPress={() => setWeekday(d.weekday)}
							accessibilityState={{ selected }}
						>
							<Text style={[styles.dayText, selected && styles.dayTextSelected]}>{d.short}</Text>
						</TouchableOpacity>
					);
				})}
			</View>

			{reportCount < MIN_REPORTS_PER_DAY ? (
				<Text style={styles.empty}>Not enough data for {dayName.toLowerCase()} yet.</Text>
			) : (
				<>
					<View style={styles.chart}>
						{HOURS.map((hour) => {
							const slot = byHour.get(hour);
							const isNow = isToday && hour === currentHour;
							return (
								<View key={hour} style={styles.barSlot}>
									<View
										style={[
											styles.bar,
											slot
												? { height: (slot.avg_level / 3) * CHART_HEIGHT, backgroundColor: barColor(slot.avg_level) }
												: styles.barEmpty,
											isNow && styles.barNow,
										]}
									/>
								</View>
							);
						})}
					</View>

					{/* Timetiketterna ligger under rätt stapel genom att ta samma bredd som staplarna */}
					<View style={styles.labelsRow}>
						{HOURS.map((hour) => (
							<View key={hour} style={styles.barSlot}>
								{HOUR_LABELS.includes(hour) && <Text style={styles.hourLabel}>{hour}</Text>}
								{isToday && hour === currentHour && !HOUR_LABELS.includes(hour) && (
									<Text style={[styles.hourLabel, styles.nowLabel]}>Now</Text>
								)}
							</View>
						))}
					</View>

					<Text style={styles.footnote}>Based on {reportCount} reports on {dayName.toLowerCase()}</Text>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	daysRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: spacing.md,
	},
	dayChip: {
		borderRadius: radius.pill,
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xs,
	},
	dayChipSelected: {
		backgroundColor: colors.greenButtonBackground,
	},
	dayText: {
		...type.caption,
		color: colors.textMuted,
		fontWeight: '600',
	},
	dayTextSelected: {
		color: colors.text,
	},
	chart: {
		height: CHART_HEIGHT,
		flexDirection: 'row',
		alignItems: 'flex-end',
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	barSlot: {
		flex: 1,
		alignItems: 'center',
	},
	bar: {
		width: '70%',
		borderTopLeftRadius: 3,
		borderTopRightRadius: 3,
	},
	// Timmar utan rapporter får en liten grå stump, så man ser att timmen finns men saknar data
	barEmpty: {
		height: EMPTY_BAR_HEIGHT,
		backgroundColor: colors.busynessUnknown,
	},
	// Timmen vi är i just nu får en mörk kant
	barNow: {
		borderWidth: 1.5,
		borderColor: colors.text,
	},
	labelsRow: {
		flexDirection: 'row',
		marginTop: spacing.xs,
	},
	// Siffrorna får gå utanför sin smala stapelbredd istället för att radbrytas
	hourLabel: {
		...type.caption,
		fontSize: 11,
		color: colors.textMuted,
		width: 40,
		textAlign: 'center',
	},
	nowLabel: {
		color: colors.text,
		fontWeight: '700',
	},
	footnote: {
		...type.caption,
		fontSize: 11,
		color: colors.textMuted,
		marginTop: spacing.sm,
	},
	empty: {
		...type.caption,
		color: colors.textMuted,
		textAlign: 'center',
		paddingVertical: spacing.md,
	},
});
