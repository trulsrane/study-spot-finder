import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { Host, Image } from '@expo/ui/swift-ui';
import { frame, glassEffect } from '@expo/ui/swift-ui/modifiers';

import { ReviewForm } from '@/src/components/ReviewForm';
import { ReviewInsert } from '@/src/types/db';
import { colors, radius, spacing, type } from '@/src/theme';

type Props = {
	visible: boolean;
	onSubmit: (input: Pick<ReviewInsert, 'user_id' | 'rating' | 'comment'>) => Promise<string | null>;
	submitting: boolean;
	onClose: () => void;
};

// Popup med recensionsformuläret, som visas när man checkar ut från en plats man inte har recenserat.
// Glaset byggs som i BusynessLegend: en osynlig SwiftUI-ikon bär glaset bakom rutan, och formuläret
// ligger ovanpå som vanliga vyer. Ligger innehållet inuti glaset tappar det sina färger.
export function ReviewModal({ visible, onSubmit, submitting, onClose }: Props) {
	// Storleken på rutan, så att glaset bakom blir exakt lika stort
	const [size, setSize] = useState<{ width: number; height: number } | null>(null);

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			{/* Flyttar upp rutan när tangentbordet öppnas */}
			<KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
				<View>
					{Platform.OS === 'ios' && size && (
						<Host matchContents style={styles.glass}>
							<Image
								systemName="circle"
								size={1}
								color="#00000000"
								modifiers={[
									frame({ width: size.width, height: size.height }),
									glassEffect({ glass: { variant: 'regular' }, shape: 'roundedRectangle', cornerRadius: radius.lg }),
								]}
							/>
						</Host>
					)}

					<View
						style={[styles.card, Platform.OS !== 'ios' && styles.cardFallback]}
						onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
					>
						<Text style={styles.title}>How was your visit?</Text>
						<ReviewForm alwaysOpen onSubmit={onSubmit} submitting={submitting} onClose={onClose} style={styles.form} />
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		justifyContent: 'center',
		padding: spacing.lg,
		backgroundColor: colors.overlay,
	},
	// Glaset ligger bakom rutan, i samma storlek
	glass: {
		position: 'absolute',
		top: 0,
		left: 0,
	},
	card: {
		padding: spacing.md,
		gap: spacing.sm,
		borderRadius: radius.lg,
	},
	// Android har inget Liquid Glass, där blir rutan vit som ReviewForm
	cardFallback: {
		backgroundColor: colors.cardBackground,
	},
	title: {
		...type.heading,
		color: colors.text,
		textAlign: 'center',
	},
	// Formuläret får ingen egen vit ruta, glaset bakom är rutan
	form: {
		marginTop: 0,
		padding: 0,
		borderWidth: 0,
		backgroundColor: 'transparent',
	},
});
