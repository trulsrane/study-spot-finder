import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import useAuth from '@/src/hooks/useAuth'

export default function LoginScreen() {
  const { email, setEmail, password, setPassword, loading, signInWithEmail } = useAuth()
  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword}
        secureTextEntry autoCapitalize="none" style={styles.input} />
      <TouchableOpacity disabled={loading} onPress={signInWithEmail} style={styles.button}>
        <Text>Log in</Text>
      </TouchableOpacity>
      {/* Registreringen har en egen sida med användarnamn, se signup.tsx */}
      <Link href="/profile/signup" asChild>
        <TouchableOpacity style={styles.button}>
          <Text>Sign up</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  button: { padding: 12, alignItems: 'center', borderWidth: 1, borderRadius: 8 },
})