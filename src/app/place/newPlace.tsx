import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAddPlace } from '@/src/hooks/useAddPlace';
import { useSession } from '@/src/hooks/useSession';
import { colors, radius, spacing, type } from '@/src/theme';

export default function NewPlaceScreen() {
  const { lat, lng } = useLocalSearchParams<{ lat: string; lng: string }>();
  const latitude = Number(lat);
  const longitude = Number(lng);
  const router = useRouter();
  const userId = useSession()?.user.id;
  const { addPlace, saving, error } = useAddPlace();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [openingHours, setOpeningHours] = useState('');

  // Föreslår en adress utifrån koordinaterna med telefonens inbyggda geocoder (gratis, ingen API-nyckel)
  useEffect(() => {
    let cancelled = false;
    Location.reverseGeocodeAsync({ latitude, longitude })
      .then(([result]) => {
        if (cancelled || !result) return;
        const street = [result.street, result.streetNumber].filter(Boolean).join(' ');
        const suggestion = [street, result.city].filter(Boolean).join(', ');
        // Skriv inte över om användaren redan hunnit skriva något
        setAddress((current) => current || suggestion);
      })
      .catch(() => {}); // Hittades ingen adress får användaren skriva in den själv
    return () => { cancelled = true; };
  }, [latitude, longitude]);

  const canSave = name.trim().length > 0 && !saving && !!userId;

  const handleSave = async () => {
    if (!canSave) return;
    const place = await addPlace({
      name: name.trim(),
      latitude,
      longitude,
      address: address.trim() || null,
      building: building.trim() || null,
      floor: floor.trim() || null,
      opening_hours: openingHours.trim() || null,
      created_by: userId,
    });
    if (place) router.back();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Field label="Namn *" value={name} onChangeText={setName} placeholder="t.ex. Läsesalen plan 2" />
      <Field label="Adress" value={address} onChangeText={setAddress} placeholder="Hämtar adress..." />
      <Field label="Byggnad" value={building} onChangeText={setBuilding} />
      <Field label="Våning" value={floor} onChangeText={setFloor} />
      <Field label="Öppettider" value={openingHours} onChangeText={setOpeningHours} placeholder="t.ex. 08–20" />

      {error && <Text style={styles.error}>Kunde inte spara: {error}</Text>}

      <Pressable
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!canSave}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Sparar...' : 'Spara plats'}</Text>
      </Pressable>
    </ScrollView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

function Field({ label, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...inputProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...type.caption,
    color: colors.textMuted,
  },
  input: {
    ...type.body,
    color: colors.text,
    backgroundColor: colors.buttonBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  error: {
    ...type.body,
    color: colors.favorite,
  },
  saveButton: {
    backgroundColor: colors.greenButtonBackground,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...type.buttonText,
    color: colors.text,
  },
});
