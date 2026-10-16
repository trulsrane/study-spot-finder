import { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/src/hooks/useSession';
import { ReviewInsert } from '@/src/types/db';
import { colors, spacing, type, radius } from '@/src/theme';

type ReviewFormProps = {
	onSubmit: (input: Pick<ReviewInsert, 'user_id' | 'rating' | 'comment'>) => Promise<string | null>;
	submitting: boolean;
};

export function ReviewForm({ onSubmit, submitting }: ReviewFormProps) {
	const userId = useSession()?.user.id;
	const [open, setOpen] = useState(false);
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState('');
	const [formError, setFormError] = useState<string | null>(null);

	// Visar först endast en knapp
	// Om användaren klickar på "+Write a review" så visas formuläret
	if (!open) {
		return (
			<TouchableOpacity style={styles.openButton} onPress={handleOpen}>
				<Ionicons name="add" size={16} color={colors.icon} />
				<Text style={styles.openButtonText}>Write a review</Text>
			</TouchableOpacity>
		);
	}

	// Hanterar att en icke-inloggad användare inte kan skriva en recension
	function handleOpen() {
		if (!userId) {
			Alert.alert('Log in', 'You need to be logged in to write a review.');
			return;
		}
		setOpen(true);
	}

	async function handleSubmit() {
		if (rating === 0) {
			setFormError('Choose a rating first.');
			return;
		}
		setFormError(null);

		const errorMessage = await onSubmit({
			user_id: userId!,
			rating,
			comment: comment.trim() || null,
		});

		if (errorMessage) {
			// setFormError(errorMessage);
			// return;
			Alert.alert('Cannot write a review', 'You have already written a review for this place.');
			return;
		}

		// Om recensionen skickades in utan fel, nollställ formuläret och stäng det
		setRating(0);
		setComment('');
		setOpen(false);
	}

	return (
		<View style={styles.form}>
			{/* Klickbara stjärnor där användaren kan klicka i sitt betyg */}
			{/* Från claude... */}
			{/* Kan ändra ikoner, utseende, osv senare <3 */}
			<Text style={styles.label}>Your rating:</Text>
			<View style={styles.starsRow}>
				{[1, 2, 3, 4, 5].map((n) => (
					<TouchableOpacity key={n} onPress={() => setRating(n)} hitSlop={6}>
						<Ionicons
							name={n <= rating ? 'star' : 'star-outline'}
							size={28}
							color={colors.icon}
						/>
					</TouchableOpacity>
				))}
			</View>

			<TextInput
				style={styles.input}
				value={comment}
				onChangeText={setComment}
				placeholder="Write something a review (is optional)"
				placeholderTextColor={colors.textMuted}
				multiline
			/>

			{formError && <Text style={styles.error}>{formError}</Text>}

			{/* Användaren kan välja att avbryta eller skicka in sin recension */}
			<View style={styles.buttonsRow}>
				<TouchableOpacity
					style={styles.cancelButton}
					onPress={() => { setOpen(false); setFormError(null); }}
					disabled={submitting}
				>
					<Text style={styles.cancelText}>Cancel</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.submitButton, submitting && { opacity: 0.5 }]}
					onPress={handleSubmit}
					disabled={submitting}
				>
					<Text style={styles.submitText}>{submitting ? 'Saving...' : 'Post review'}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	hint: {
		...type.caption,
		color: colors.textMuted,
		marginTop: spacing.sm,
	},
	openButton: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		gap: 4,
		backgroundColor: colors.greenButtonBackground,
		borderRadius: radius.pill,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		marginTop: spacing.sm,
	},
	openButtonText: {
		color: colors.text,
		fontSize: type.buttonText.fontSize,
		fontWeight: type.buttonText.fontWeight,
	},
	form: {
		marginTop: spacing.sm,
		padding: spacing.md,
		backgroundColor: colors.cardBackground,
		borderRadius: radius.md,
	},
	label: {
		...type.caption,
		color: colors.textMuted,
		marginBottom: spacing.xs,
	},
	starsRow: {
		flexDirection: 'row',
		gap: spacing.xs,
		marginBottom: spacing.sm,
	},
	input: {
		...type.body,
		color: colors.text,
		minHeight: 80,
		textAlignVertical: 'top',
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		padding: spacing.sm,
	},
	error: {
		...type.caption,
		color: 'red',
		marginTop: spacing.xs,
	},
	buttonsRow: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: spacing.sm,
		marginTop: spacing.sm,
	},
	cancelButton: {
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
	},
	cancelText: {
		color: colors.textMuted,
		fontSize: type.buttonText.fontSize,
	},
	submitButton: {
		backgroundColor: colors.greenButtonBackground,
		borderRadius: radius.pill,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
	},
	submitText: {
		color: colors.text,
		fontSize: type.buttonText.fontSize,
		fontWeight: type.buttonText.fontWeight,
	},
});