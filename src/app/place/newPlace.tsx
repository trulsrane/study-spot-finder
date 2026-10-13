import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAddPlace } from '@/src/hooks/useAddPlace';
import { useSession } from '@/src/hooks/useSession';
import { colors, radius, spacing, type } from '@/src/theme';
import { amenityOptions } from '@/src/utils/translatePlaceToInfoPage';

export default function NewPlaceScreen() {
  // building och floor skickas med från planvyn för ett hus, då är de redan ifyllda
  const params = useLocalSearchParams<{ lat: string; lng: string; building?: string; floor?: string }>();
  const { lat, lng } = params;
  const latitude = Number(lat);
  const longitude = Number(lng);
  const router = useRouter();
  const userId = useSession()?.user.id;
  const { addPlace, saving, error } = useAddPlace();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [building, setBuilding] = useState(params.building ?? '');
  const [floor, setFloor] = useState(params.floor ?? '');
  const [openingHours, setOpeningHours] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const toggleAmenity = (key: string) =>
    setAmenities((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );

  // Föreslår en adress utifrån koordinaterna med telefonens inbyggda geocoder 
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
      amenities,
      description: description.trim() || null,
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
      <Field label="Name *" value={name} onChangeText={setName} placeholder="e.g. Reading room, floor 2" />
      <Field label="Address" value={address} onChangeText={setAddress} placeholder="Fetching address..." />
      <Field label="Building" value={building} onChangeText={setBuilding} />
      <Field label="Floor" value={floor} onChangeText={setFloor} />
      <Field label="Opening hours" value={openingHours} onChangeText={setOpeningHours} placeholder="e.g. 08–20" />

      {/* Samma ikoner som visas på platsens infosida, tryck för att välja/avmarkera */}
      <View style={styles.field}>
        <Text style={styles.label}>Amenities</Text>
        <View style={styles.amenitiesRow}>
          {amenityOptions.map((a) => {
            const selected = amenities.includes(a.key);
            return (
              <Pressable
                key={a.key}
                style={[styles.amenityPill, selected && styles.amenityPillSelected]}
                onPress={() => toggleAmenity(a.key)}
              >
                <View style={styles.amenityCircle}>
                  <Ionicons name={a.icon} size={13} color={colors.icon} />
                </View>
                <Text style={styles.amenityLabel}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Info about the place</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Quiet reading room with large windows"
          multiline
          textAlignVertical="top"
        />
      </View>

      {error && <Text style={styles.error}>Could not save: {error}</Text>}

      <Pressable
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!canSave}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save place'}</Text>
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
  multilineInput: {
    minHeight: 100,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.buttonBackground,
    opacity: 0.6,
  },
  amenityPillSelected: {
    borderColor: colors.amenityCircle,
    backgroundColor: colors.busynessLow,
    opacity: 1,
  },
  amenityCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.amenityCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: {
    ...type.amenityLabel,
    color: colors.text,
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
