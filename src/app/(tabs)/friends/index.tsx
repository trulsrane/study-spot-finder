import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, TouchableHighlight} from 'react-native';
import { useFriends, FriendshipWithProfile } from '@/src/hooks/useFriends';
import { colors, radius, spacing, type } from '@/src/theme';
import { useProfile } from '@/src/hooks/useProfile';
import { opacity } from '@expo/ui/swift-ui/modifiers';
import { useRouter } from 'expo-router';


// Visningsnamn om det finns, annars användarnamn (samma som för recensioner)
function nameOf(f: FriendshipWithProfile) {
	return f.other?.display_name ?? f.other?.username ?? 'Unknown user';
}

function picOf(f: FriendshipWithProfile) {
	return f.other?.avatar_url ?? "No image";
}

export default function FriendsScreen() {
	const router = useRouter();
	const { friends, incoming, outgoing, loading, error, refetch, sendRequest, acceptRequest, removeFriendship } = useFriends();
	const { profile } = useProfile();
	const [username, setUsername] = useState('');
	const [sending, setSending] = useState(false);
	const [busy, setBusy] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [formInfo, setFormInfo] = useState<string | null>(null);

	// Skickar en vänförfrågan, visar felmeddelande om det inte gick bra, annars nollställer formuläret och visar info-texten från databasen
	async function handleSend() {
		if (!username.trim() || sending) return;
		setSending(true);
		setFormError(null);
		setFormInfo(null);
		const { error: sendError, info } = await sendRequest(username.trim());
		setSending(false);
		// Om det blev ett fel, visa det. Annars visa info-texten från databasen och nollställ formuläret.
		if (sendError) {
			setFormError(sendError);
			return;
		}
		// Om det gick bra, visa info-texten från databasen och nollställ formuläret.
		setFormInfo(info);
		setUsername('');
	}

	// Tar emot en funktion (inte ett promise) så att ett andra tryck stoppas innan något skickas
	// (annars kan man trycka flera gånger och skicka flera requests)
	async function run(action: () => Promise<string | null>) {
		if (busy) return; // Om det redan pågår en åtgärd, gör inget
		setBusy(true); // Sätt busy innan vi kör action, så att man inte kan trycka flera gånger
		const errorMessage = await action();
		setBusy(false); 
		if (errorMessage) Alert.alert('Something went wrong', errorMessage); // Om det blev ett fel, visa det i en alert. Annars gör inget (listan uppdateras redan via useFriends).
	}

	// Visar en bekräftelsedialog innan man tar bort en vänrelation
	function confirmRemove(f: FriendshipWithProfile) {
		Alert.alert('Remove friend', `Remove ${nameOf(f)} as a friend?`, [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Remove', style: 'destructive', onPress: () => run(() => removeFriendship(f.id)) },
		]);
	}

	function seeFriendProfile(f: FriendshipWithProfile){
		if(!f.other?.id) return;
		router.push({pathname: '/friends/[id]', params: {id: f.other.id}})
	}

	if (loading) return <Text style={styles.message}>Loading...</Text>;
	if (error) return <Text style={styles.message}>{error}</Text>; // Om det blev ett fel vid hämtning, visa det. (Det går att dra nedåt för att hämta om listan, se nedan.)
	if (!profile) return <Text style={styles.message}>No profile found</Text>;
	// Dra nedåt för att hämta om listan, t.ex. när någon just skickat en förfrågan till dig
	return (
		<ScrollView
			style={styles.container}
			keyboardShouldPersistTaps="handled" // Gör så du kan trycka på knappar även om tangentbordet är uppe (t.ex. "send").
			refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />} // Dra nedåt för att hämta om listan
		>
			{/* Formulär för att skicka en vänförfrågan */}
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
			{/* Visar felmeddelande eller info-text från databasen (t.ex. "Friend request sent!" eller "You are now friends!")*/}
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
							{/* Avbryt skickad förfrågan */}
							<TouchableOpacity style={styles.plainButton} onPress={() => run(() => removeFriendship(f.id))} disabled={busy}>
								<Text style={styles.mutedText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					))}
				</>
			)}

			{/* Vänner */}
			<Text style={styles.caption}>Friends ({friends.length})</Text>
			{friends.length === 0 ? (
				<Text style={styles.message}>No friends yet.</Text>
			) : (
				friends.map((f) => (
					<TouchableHighlight
						key={f.id}
						underlayColor={colors.buttonpress}
						activeOpacity={0.8}
						onPress={() => seeFriendProfile(f)}
					>
						<View style={styles.row}>
							{profile.avatar_url ? (
												<Image source={{ uri: picOf(f) }} style={styles.profilePicture} />
											) : (
												<View style={[styles.profilePicture, styles.profilePictureFallback]}>
													<Text style={styles.profilePictureInitial}>
														{profile.username?.charAt(0).toUpperCase() ?? 'U'}
													</Text>
												</View>
											)}
							<Text style={styles.name}>{nameOf(f)}</Text>
							{/* Tar bort vänrelationen, visar en bekräftelsedialog först */}
							<TouchableOpacity style={styles.plainButton} onPress={() => confirmRemove(f)} disabled={busy}>
								<Text style={styles.mutedText}>Remove</Text>
							</TouchableOpacity>
						</View>
					</TouchableHighlight>
				))
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: spacing.md, backgroundColor: colors.background},
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
	profilePicture: {
		width: 50,
		height: 50,
		borderRadius: radius.pill,
		borderWidth: 4,
		borderColor: colors.cardBackground,
	},
	profilePictureFallback: {
		backgroundColor: colors.amenityCircle,
		alignItems: 'center',
		justifyContent: 'center',
	},
	profilePictureInitial: {
		fontSize: 44,
		fontWeight: '600',
		color: colors.text,
	},

});
