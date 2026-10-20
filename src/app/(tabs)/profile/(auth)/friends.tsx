import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFriends, FriendshipWithProfile } from '@/src/hooks/useFriends';
import { colors, radius, spacing, type } from '@/src/theme';

// Visningsnamn om det finns, annars användarnamn (samma som för recensioner)
function nameOf(f: FriendshipWithProfile) {
	return f.other?.display_name ?? f.other?.username ?? 'Unknown user';
}

export default function FriendsScreen() {
	const { friends, incoming, outgoing, loading, error, refetch, sendRequest, acceptRequest, removeFriendship } = useFriends();
	const [username, setUsername] = useState('');
	const [sending, setSending] = useState(false);
	const [busy, setBusy] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [formInfo, setFormInfo] = useState<string | null>(null);

	async function handleSend() {
		if (!username.trim() || sending) return;
		setSending(true);
		setFormError(null);
		setFormInfo(null);
		const { error: sendError, info } = await sendRequest(username.trim());
		setSending(false);
		if (sendError) {
			setFormError(sendError);
			return;
		}
		setFormInfo(info);
		setUsername('');
	}

	// Tar emot en funktion (inte ett promise) så att ett andra tryck stoppas innan något skickas
	async function run(action: () => Promise<string | null>) {
		if (busy) return;
		setBusy(true);
		const errorMessage = await action();
		setBusy(false);
		if (errorMessage) Alert.alert('Something went wrong', errorMessage);
	}

	function confirmRemove(f: FriendshipWithProfile) {
		Alert.alert('Remove friend', `Remove ${nameOf(f)} as a friend?`, [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Remove', style: 'destructive', onPress: () => run(() => removeFriendship(f.id)) },
		]);
	}

	if (loading) return <Text style={styles.message}>Loading...</Text>;
	if (error) return <Text style={styles.message}>{error}</Text>;

	// Dra nedåt för att hämta om listan, t.ex. när någon just skickat en förfrågan till dig
	return (
		<ScrollView
			style={styles.container}
			keyboardShouldPersistTaps="handled"
			refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
		>
			<Text style={styles.caption}>Add friend</Text>
			<View style={styles.addRow}>
				<TextInput
					style={styles.input}
					value={username}
					onChangeText={setUsername}
					placeholder="Username"
					placeholderTextColor={colors.textMuted}
					autoCapitalize="none"
					autoCorrect={false}
					returnKeyType="send"
					onSubmitEditing={handleSend}
				/>
				<TouchableOpacity style={styles.greenButton} onPress={handleSend} disabled={sending}>
					<Text style={styles.buttonText}>{sending ? 'Sending...' : 'Send'}</Text>
				</TouchableOpacity>
			</View>
			{formError && <Text style={styles.error}>{formError}</Text>}
			{formInfo && <Text style={styles.info}>{formInfo}</Text>}

			{/* Inkomna förfrågningar, visas bara om det finns några */}
			{incoming.length > 0 && (
				<>
					<Text style={styles.caption}>Friend requests ({incoming.length})</Text>
					{incoming.map((f) => (
						<View key={f.id} style={styles.row}>
							<Text style={styles.name}>{nameOf(f)}</Text>
							<TouchableOpacity style={styles.greenButton} onPress={() => run(() => acceptRequest(f.id))} disabled={busy}>
								<Text style={styles.buttonText}>Accept</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.plainButton} onPress={() => run(() => removeFriendship(f.id))} disabled={busy}>
								<Text style={styles.mutedText}>Decline</Text>
							</TouchableOpacity>
						</View>
					))}
				</>
			)}

			{/* Förfrågningar jag har skickat */}
			{outgoing.length > 0 && (
				<>
					<Text style={styles.caption}>Sent requests</Text>
					{outgoing.map((f) => (
						<View key={f.id} style={styles.row}>
							<Text style={styles.name}>{nameOf(f)}</Text>
							<TouchableOpacity style={styles.plainButton} onPress={() => run(() => removeFriendship(f.id))} disabled={busy}>
								<Text style={styles.mutedText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					))}
				</>
			)}

			<Text style={styles.caption}>Friends ({friends.length})</Text>
			{friends.length === 0 ? (
				<Text style={styles.message}>No friends yet.</Text>
			) : (
				friends.map((f) => (
					<View key={f.id} style={styles.row}>
						<Text style={styles.name}>{nameOf(f)}</Text>
						<TouchableOpacity style={styles.plainButton} onPress={() => confirmRemove(f)} disabled={busy}>
							<Text style={styles.mutedText}>Remove</Text>
						</TouchableOpacity>
					</View>
				))
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: spacing.md },
	caption: { ...type.heading, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
	message: { ...type.body, color: colors.textMuted },
	addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
	input: {
		...type.body,
		flex: 1,
		color: colors.text,
		backgroundColor: colors.cardBackground,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		padding: spacing.sm,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		backgroundColor: colors.cardBackground,
		borderRadius: radius.md,
		padding: spacing.sm,
		marginBottom: spacing.sm,
	},
	name: { ...type.body, flex: 1, color: colors.text },
	greenButton: {
		backgroundColor: colors.greenButtonBackground,
		borderRadius: radius.pill,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
	},
	plainButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
	buttonText: { color: colors.text, fontSize: type.buttonText.fontSize, fontWeight: type.buttonText.fontWeight },
	mutedText: { color: colors.textMuted, fontSize: type.buttonText.fontSize },
	error: { ...type.caption, color: colors.favorite, marginTop: spacing.xs },
	info: { ...type.caption, color: colors.textMuted, marginTop: spacing.xs },
});
